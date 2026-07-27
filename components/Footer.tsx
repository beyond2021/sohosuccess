export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 px-6 md:px-10 py-8 max-w-7xl mx-auto text-sm text-white/20">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <span>© 2026 Soho Success — built with Next.js 13 &amp; award-winning design</span>
        <div className="flex items-center gap-5">
          <a href="#" className="hover:text-white/50 transition"><i className="fa-brands fa-github"></i></a>
          <a href="#" className="hover:text-white/50 transition"><i className="fa-brands fa-x-twitter"></i></a>
          <a href="#" className="hover:text-white/50 transition"><i className="fa-brands fa-linkedin-in"></i></a>
          <a href="#" className="hover:text-white/50 transition"><i className="fa-brands fa-dribbble"></i></a>
        </div>
      </div>
    </footer>
  );
}
