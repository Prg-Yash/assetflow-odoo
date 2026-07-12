"use client";

import { useState } from "react";
import styles from "./navbar.module.css";

type NavbarProps = {
  isAuthenticated?: boolean;
  setIsAuthenticated?: (value: boolean) => void;
};

export default function Navbar({
  isAuthenticated = false,
  setIsAuthenticated = () => {},
}: NavbarProps) {
  return (
    <NavbarShell
      isAuthenticated={isAuthenticated}
      setIsAuthenticated={setIsAuthenticated}
    />
  );
}

function NavbarShell({
  isAuthenticated,
  setIsAuthenticated,
}: Required<NavbarProps>) {
  const [isProfile, setIsProfile] = useState(false);

  function toggleProfile() {
    setIsProfile(!isProfile);
  }

  function handleSignOut() {
    setIsAuthenticated(false);
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <a href="/" className={styles.brand}>
          <img src="/icon.jpg" width={52} height={52} alt="AssetFlow" />
        </a>
        <div className={styles.rightSide}>
          <button
            type="button"
            onClick={toggleProfile}
            className={styles.avatarButton}
            id="user-menu-button"
            aria-expanded={isProfile ? "true" : "false"}
          >
            <span className="sr-only">Open user menu</span>
            <img className={styles.avatar} src="/user.jpg" alt="user photo" />
          </button>

          {isAuthenticated ? (
            <div
              className={`${styles.dropdown} ${
                isProfile ? styles.dropdownOpen : styles.dropdownClosed
              }`}
              id="user-dropdown"
            >
              <div className={styles.dropdownHeader}>
                <span className={styles.dropdownName}>
                  Rayyan Shaikh
                </span>
                <span className={styles.dropdownEmail}>
                  rayyan.shaikhh@gmail.com
                </span>
              </div>
              <ul className={styles.dropdownList} aria-labelledby="user-menu-button">
                <li>
                  <a
                    href="/login"
                    className={styles.dropdownItem}
                    onClick={handleSignOut}
                  >
                    Sign out
                  </a>
                </li>
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}