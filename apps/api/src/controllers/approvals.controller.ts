import { Response, NextFunction } from "express"
import { AuthRequest } from "../middleware/auth.middleware.js"
import { db } from "@repo/db"
import { ApiError } from "../middleware/error.middleware.js"
import { recordActivityLog } from "../utils/activity.util.js"
import { queueService } from "../services/queue.service.js"

export const getApprovalRequests = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!
    const { status, requestType, priority, departmentId, search } = req.query

    // Look up current user membership to check role and department
    const member = await db.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: req.user!.id,
        },
      },
      include: {
        role: true,
        user: {
          include: {
            employeeProfile: true,
          },
        },
      },
    })

    if (!member) {
      throw new ApiError(403, "Access denied. Organization membership not found.")
    }

    const userRole = member.role.roleType
    const isManager = userRole === "ADMIN" || userRole === "ASSET_MANAGER"

    if (!isManager) {
      throw new ApiError(403, "Access denied. Managers only.")
    }

    // Asset Managers with an assigned department can only view requests from their department
    const assignedDeptId = member.user.employeeProfile?.departmentId

    const where: any = {
      organizationId,
      ...(status && status !== "All" && { status: String(status) }),
      ...(requestType && requestType !== "All" && { requestType: String(requestType) }),
      ...(priority && priority !== "All" && { priority: String(priority) }),
    }

    // Department isolation:
    // If Asset Manager has a department, override filter to their department.
    // Otherwise, allow filtering by any departmentId if specified.
    if (userRole === "ASSET_MANAGER" && assignedDeptId) {
      where.OR = [
        { asset: { departmentId: assignedDeptId } },
        { employee: { departmentId: assignedDeptId } },
      ]
    } else if (departmentId && departmentId !== "All") {
      where.OR = [
        { asset: { departmentId: String(departmentId) } },
        { employee: { departmentId: String(departmentId) } },
      ]
    }

    // Search query:
    if (search && String(search).trim() !== "") {
      const q = String(search).trim()
      where.AND = [
        {
          OR: [
            { asset: { name: { contains: q, mode: "insensitive" } } },
            { asset: { assetCode: { contains: q, mode: "insensitive" } } },
            { employee: { user: { name: { contains: q, mode: "insensitive" } } } },
            { employee: { employeeCode: { contains: q, mode: "insensitive" } } },
          ],
        },
      ]
    }

    const requests = await db.approvalRequest.findMany({
      where,
      include: {
        asset: {
          include: {
            category: { select: { id: true, name: true } },
            department: { select: { id: true, name: true } },
            location: { select: { id: true, name: true } },
          },
        },
        employee: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            department: { select: { id: true, name: true } },
          },
        },
        reviewedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    res.status(200).json({
      success: true,
      data: requests,
    })
  } catch (error) {
    next(error)
  }
}

export const getApprovalStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!

    const member = await db.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: req.user!.id,
        },
      },
      include: {
        role: true,
        user: {
          include: {
            employeeProfile: true,
          },
        },
      },
    })

    if (!member) {
      throw new ApiError(403, "Access denied. Organization membership not found.")
    }

    const userRole = member.role.roleType
    const assignedDeptId = member.user.employeeProfile?.departmentId

    const baseWhere: any = { organizationId }
    if (userRole === "ASSET_MANAGER" && assignedDeptId) {
      baseWhere.OR = [
        { asset: { departmentId: assignedDeptId } },
        { employee: { departmentId: assignedDeptId } },
      ]
    }

    // 1. Pending counts
    const pendingTotal = await db.approvalRequest.count({
      where: { ...baseWhere, status: "PENDING" },
    })
    const pendingAllocations = await db.approvalRequest.count({
      where: { ...baseWhere, status: "PENDING", requestType: "ALLOCATION" },
    })
    const pendingReturns = await db.approvalRequest.count({
      where: { ...baseWhere, status: "PENDING", requestType: "RETURN" },
    })
    const pendingMaintenance = await db.approvalRequest.count({
      where: { ...baseWhere, status: "PENDING", requestType: "MAINTENANCE" },
    })

    // 2. Approved/Rejected Today counts
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const approvedToday = await db.approvalRequest.count({
      where: {
        ...baseWhere,
        status: "APPROVED",
        reviewedAt: { gte: startOfToday },
      },
    })

    const rejectedToday = await db.approvalRequest.count({
      where: {
        ...baseWhere,
        status: "REJECTED",
        reviewedAt: { gte: startOfToday },
      },
    })

    // 3. Average Approval Duration (minutes)
    const resolved = await db.approvalRequest.findMany({
      where: {
        ...baseWhere,
        status: { in: ["APPROVED", "REJECTED"] },
        reviewedAt: { not: null },
      },
      select: { createdAt: true, reviewedAt: true },
    })

    let avgApprovalTimeMinutes = 0
    if (resolved.length > 0) {
      const sumDiffMs = resolved.reduce((sum, r) => {
        return sum + (new Date(r.reviewedAt!).getTime() - new Date(r.createdAt).getTime())
      }, 0)
      avgApprovalTimeMinutes = Math.round(sumDiffMs / (1000 * 60 * resolved.length))
    }

    res.status(200).json({
      success: true,
      data: {
        pendingTotal,
        pendingAllocations,
        pendingReturns,
        pendingMaintenance,
        approvedToday,
        rejectedToday,
        avgApprovalTimeMinutes,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const createApprovalRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!
    const { assetId, requestType, priority, reason } = req.body

    if (!assetId || !requestType) {
      throw new ApiError(400, "assetId and requestType are required")
    }

    // Lookup active employee profile for the user
    const employee = await db.employee.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: req.user!.id,
        },
      },
    })

    if (!employee) {
      throw new ApiError(404, "Employee profile not found in organization.")
    }

    // Lookup asset
    const asset = await db.asset.findFirst({
      where: { id: assetId, organizationId },
    })

    if (!asset) {
      throw new ApiError(404, "Asset not found.")
    }

    // Business validations based on request type
    if (requestType === "ALLOCATION") {
      if (asset.status === "ALLOCATED") {
        throw new ApiError(400, "This asset is already allocated.")
      }
      if (asset.status === "UNDER_MAINTENANCE") {
        throw new ApiError(400, "This asset is undergoing maintenance and cannot be allocated.")
      }
    }

    // Check if there is already an active pending request for this asset
    const existing = await db.approvalRequest.findFirst({
      where: {
        organizationId,
        assetId,
        status: "PENDING",
      },
    })

    if (existing) {
      throw new ApiError(400, "There is already a pending approval request for this asset.")
    }

    const request = await db.approvalRequest.create({
      data: {
        organizationId,
        assetId,
        employeeId: employee.id,
        requestType,
        priority: priority || "MEDIUM",
        reason: reason || null,
        status: "PENDING",
      },
    })

    await recordActivityLog({
      organizationId,
      userId: req.user!.id,
      entity: "ApprovalRequest",
      entityId: request.id,
      action: "CREATED",
      metadata: { requestType, assetCode: asset.assetCode },
    })

    res.status(201).json({
      success: true,
      data: request,
    })
  } catch (error) {
    next(error)
  }
}

export const approveRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!
    const id = String(req.params.id)
    const { comments } = req.body

    const member = await db.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: req.user!.id,
        },
      },
      include: {
        role: true,
        user: {
          include: {
            employeeProfile: true,
          },
        },
      },
    })

    if (!member || (member.role.roleType !== "ADMIN" && member.role.roleType !== "ASSET_MANAGER")) {
      throw new ApiError(403, "You do not have permission to approve requests.")
    }

    const request = await db.approvalRequest.findFirst({
      where: { id, organizationId },
      include: {
        asset: true,
        employee: { include: { user: true } },
      },
    })

    if (!request) {
      throw new ApiError(404, "Approval request not found.")
    }

    if (request.status !== "PENDING") {
      throw new ApiError(400, "Request is already resolved.")
    }

    // Department isolation checks for Asset Managers
    if (member.role.roleType === "ASSET_MANAGER" && member.user.employeeProfile?.departmentId) {
      const reviewerDeptId = member.user.employeeProfile.departmentId
      const assetDeptId = request.asset.departmentId
      const employeeDeptId = request.employee.departmentId

      if (assetDeptId !== reviewerDeptId && employeeDeptId !== reviewerDeptId) {
        throw new ApiError(403, "You can only approve requests belonging to your department.")
      }
    }

    // Execute state transition atomically
    await db.$transaction(async (tx) => {
      await tx.approvalRequest.update({
        where: { id },
        data: {
          status: "APPROVED",
          reviewedById: req.user!.id,
          reviewedAt: new Date(),
          comments: comments || null,
        },
      })

      if (request.requestType === "ALLOCATION") {
        await tx.allocation.create({
          data: {
            organizationId,
            assetId: request.assetId,
            employeeId: request.employeeId,
            allocatedById: req.user!.id,
            status: "ACTIVE",
          },
        })

        await tx.asset.update({
          where: { id: request.assetId },
          data: { status: "ALLOCATED" },
        })
      } else if (request.requestType === "RETURN") {
        await tx.allocation.updateMany({
          where: {
            organizationId,
            assetId: request.assetId,
            employeeId: request.employeeId,
            status: "ACTIVE",
          },
          data: {
            status: "RETURNED",
            returnedAt: new Date(),
          },
        })

        await tx.asset.update({
          where: { id: request.assetId },
          data: { status: "AVAILABLE" },
        })
      } else if (request.requestType === "MAINTENANCE") {
        await tx.maintenanceRequest.create({
          data: {
            organizationId,
            assetId: request.assetId,
            raisedById: request.employee.userId,
            issue: request.reason || "Reported maintenance issue via request",
            status: "OPEN",
          },
        })

        await tx.asset.update({
          where: { id: request.assetId },
          data: { status: "UNDER_MAINTENANCE" },
        })
      }
    })

    // Queue in-app and background notification tasks
    await queueService.enqueue({
      type: "NOTIFICATION_DISPATCH",
      data: {
        organizationId,
        userId: request.employee.userId,
        title: `Request Approved: ${request.requestType}`,
        body: `Your request for ${request.asset.name} (${request.asset.assetCode}) was approved.`,
        userEmail: request.employee.user.email,
      },
    })

    await recordActivityLog({
      organizationId,
      userId: req.user!.id,
      entity: "ApprovalRequest",
      entityId: id,
      action: "APPROVED",
      metadata: { requestType: request.requestType, assetCode: request.asset.assetCode },
    })

    res.status(200).json({
      success: true,
      message: "Request approved successfully.",
    })
  } catch (error) {
    next(error)
  }
}

export const rejectRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!
    const id = String(req.params.id)
    const { rejectionReason, comments } = req.body

    if (!rejectionReason) {
      throw new ApiError(400, "Rejection reason is required")
    }

    const member = await db.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: req.user!.id,
        },
      },
      include: {
        role: true,
        user: {
          include: {
            employeeProfile: true,
          },
        },
      },
    })

    if (!member || (member.role.roleType !== "ADMIN" && member.role.roleType !== "ASSET_MANAGER")) {
      throw new ApiError(403, "You do not have permission to reject requests.")
    }

    const request = await db.approvalRequest.findFirst({
      where: { id, organizationId },
      include: {
        asset: true,
        employee: { include: { user: true } },
      },
    })

    if (!request) {
      throw new ApiError(404, "Approval request not found.")
    }

    if (request.status !== "PENDING") {
      throw new ApiError(400, "Request is already resolved.")
    }

    // Department isolation checks for Asset Managers
    if (member.role.roleType === "ASSET_MANAGER" && member.user.employeeProfile?.departmentId) {
      const reviewerDeptId = member.user.employeeProfile.departmentId
      const assetDeptId = request.asset.departmentId
      const employeeDeptId = request.employee.departmentId

      if (assetDeptId !== reviewerDeptId && employeeDeptId !== reviewerDeptId) {
        throw new ApiError(403, "You can only reject requests belonging to your department.")
      }
    }

    await db.approvalRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
        rejectionReason,
        comments: comments || null,
        reviewedById: req.user!.id,
        reviewedAt: new Date(),
      },
    })

    // Queue in-app and background notification tasks
    await queueService.enqueue({
      type: "NOTIFICATION_DISPATCH",
      data: {
        organizationId,
        userId: request.employee.userId,
        title: `Request Rejected: ${request.requestType}`,
        body: `Your request for ${request.asset.name} (${request.asset.assetCode}) was rejected. Reason: ${rejectionReason}`,
        userEmail: request.employee.user.email,
      },
    })

    await recordActivityLog({
      organizationId,
      userId: req.user!.id,
      entity: "ApprovalRequest",
      entityId: id,
      action: "REJECTED",
      metadata: { requestType: request.requestType, rejectionReason },
    })

    res.status(200).json({
      success: true,
      message: "Request rejected successfully.",
    })
  } catch (error) {
    next(error)
  }
}
