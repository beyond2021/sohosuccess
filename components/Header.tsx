"use client";

import { useState } from "react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
        <a
          href="#"
          className="flex items-center gap-2 text-xl font-extrabold tracking-tight"
        >
          <div className="flex">
            <span className="gradient-text">Soho</span>
            <span className="text-white/80 font-medium">success</span>
          </div>

          <span className="text-xs font-mono text-white/30 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
            v2.0
          </span>
        </a>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
          <a href="#web" className="hover:text-white transition">
            Web
          </a>
          <a href="#it" className="hover:text-white transition">
            IT
          </a>
          <a href="#mobile" className="hover:text-white transition">
            Mobile
          </a>
          <a href="#contact" className="hover:text-white transition">
            Contact
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <a
            href="#contact"
            className="hidden md:inline-block px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 transition"
          >
            Let's talk
          </a>
          <button
            onClick={toggle}
            className="md:hidden text-white/70 hover:text-white text-xl"
            aria-label="Menu"
          >
            <i
              className={isOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars"}
            ></i>
          </button>
        </div>
      </div>
      <div
        className={`md:hidden glass-dark border-b border-white/5 px-6 py-5 transition-all duration-300 ${isOpen ? "block" : "hidden"}`}
      >
        <div className="flex flex-col gap-4 text-sm font-medium text-white/70">
          <a
            href="#web"
            onClick={close}
            className="hover:text-white transition py-1 border-b border-white/5"
          >
            Web Development
          </a>
          <a
            href="#it"
            onClick={close}
            className="hover:text-white transition py-1 border-b border-white/5"
          >
            IT Services
          </a>
          <a
            href="#mobile"
            onClick={close}
            className="hover:text-white transition py-1 border-b border-white/5"
          >
            Mobile Apps
          </a>
          <a
            href="#contact"
            onClick={close}
            className="hover:text-white transition py-1"
          >
            Contact
          </a>
          <a
            href="#contact"
            onClick={close}
            className="mt-2 inline-block text-center px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold shadow-lg shadow-purple-600/25"
          >
            Start a project
          </a>
        </div>
      </div>
    </header>
  );
}
