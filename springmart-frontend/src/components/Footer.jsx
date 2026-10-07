// src/components/Footer.jsx
import React from "react";
import { FiArrowUpRight, FiGithub } from "react-icons/fi";
import styles from "../styles/components/Footer.module.scss";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.left}>
          <span className={styles.brand}>SpringMart</span>
          <span className={styles.dot} aria-hidden="true">•</span>
          <span className={styles.tagline}>Product catalog</span>
        </div>

        <div className={styles.right}>
          <a
            href="https://shreyansr.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
            title="Shreyan Sardar Portfolio"
          >
            <span>Shreyan Sardar</span>
            <FiArrowUpRight className={styles.icon} />
          </a>
          <span className={styles.divider} aria-hidden="true">/</span>
          <a
            href="https://github.com/shreyansr01/spring-mart"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
            title="SpringMart Repository on GitHub"
          >
            <FiGithub className={styles.icon} />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
