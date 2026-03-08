import { Link, NavLink } from "react-router-dom";

export const Footer = () => {
    return (
        <footer className="bg-slate-950 text-slate-400 pt-24 pb-12 overflow-hidden relative">
            {/* Glow effect */}
            <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-blue-600/5 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-20 border-b border-slate-800">
                    <div className="lg:col-span-4 space-y-8">
                        <NavLink to="/" className="flex items-center gap-3 no-underline group" aria-label="Go to home">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/30 group-hover:scale-110 transition-transform duration-300">
                                <span className="material-symbols-outlined text-2xl font-bold">handyman</span>
                            </div>
                            <h2 className="text-2xl font-black tracking-tight text-white font-display">
                                Handy<span className="text-blue-500">Hub</span>
                            </h2>
                        </NavLink>
                        <p className="text-lg leading-relaxed text-slate-400 max-w-sm">
                            Nền tảng kết nối thợ chuyên nghiệp hàng đầu Việt Nam. Chất lượng, uy tín và tận tâm trong từng dịch vụ.
                        </p>
                        <div className="flex gap-4">
                            {["facebook", "instagram", "twitter", "youtube"].map((social) => (
                                <a key={social} href="#" className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:border-blue-500 hover:text-white transition-all duration-300">
                                    <span className="text-[10px] uppercase font-black">{social[0]}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-white font-bold uppercase tracking-widest text-xs">Công ty</h3>
                        <ul className="space-y-4 text-sm">
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Về chúng tôi</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Tuyển dụng</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Tin tức</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Liên hệ</a></li>
                        </ul>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-white font-bold uppercase tracking-widest text-xs">Khách hàng</h3>
                        <ul className="space-y-4 text-sm">
                            <li><Link to="/handymen" className="hover:text-blue-400 transition-colors">Tìm thợ</Link></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Cách hoạt động</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Bảo hành</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Hỗ trợ</a></li>
                        </ul>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-white font-bold uppercase tracking-widest text-xs">Đối tác</h3>
                        <ul className="space-y-4 text-sm">
                            <li><Link to="/auth/register/worker" className="hover:text-blue-400 transition-colors">Trở thành thợ</Link></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Góc chuyên gia</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Cộng đồng</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Quản lý</a></li>
                        </ul>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-white font-bold uppercase tracking-widest text-xs">Ứng dụng</h3>
                        <div className="space-y-3">
                            <a href="#" className="flex items-center gap-3 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 hover:border-slate-700 transition-all">
                                <span className="material-symbols-outlined text-white text-xl">apple</span>
                                <div className="text-[10px] leading-tight flex flex-col">
                                    <span className="text-slate-500">Tải trên</span>
                                    <span className="text-white font-bold text-xs uppercase">App Store</span>
                                </div>
                            </a>
                            <a href="#" className="flex items-center gap-3 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 hover:border-slate-700 transition-all">
                                <span className="material-symbols-outlined text-white text-xl">play_store</span>
                                <div className="text-[10px] leading-tight flex flex-col">
                                    <span className="text-slate-500">Tải trên</span>
                                    <span className="text-white font-bold text-xs uppercase">Google Play</span>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-sm">© 2026 HandyHub Inc. All rights reserved.</p>
                    <div className="flex gap-8 text-sm">
                        <a href="#" className="hover:text-white transition-colors">Quyền riêng tư</a>
                        <a href="#" className="hover:text-white transition-colors">Điều khoản</a>
                        <a href="#" className="hover:text-white transition-colors">Sitemap</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

