export const Footer = () => {
    return (
        <footer className="border-t border-[#f0f2f4] bg-white pt-16">
            <div className="mx-auto max-w-[1200px] px-4 md:px-10 lg:px-40">
                <div className="grid grid-cols-2 gap-8 pb-12 md:grid-cols-4">
                    <div className="col-span-2 md:col-span-1">
                        <div className="mb-4 flex items-center gap-2">
                            <div className="flex size-6 items-center justify-center rounded bg-primary/10 text-primary">
                                <span className="material-symbols-outlined text-lg">handyman</span>
                            </div>
                            <h2 className="text-base font-bold text-[#111418]">HandyHub</h2>
                        </div>
                        <p className="text-sm text-[#617589]">
                            Connecting you with trusted local professionals for all your home service
                            needs.
                        </p>
                    </div>
                    <div>
                        <h3 className="mb-4 text-sm font-bold text-[#111418]">Company</h3>
                        <ul className="flex flex-col gap-2 text-sm text-[#617589]">
                            <li>
                                <a className="hover:text-primary" href="#">
                                    About Us
                                </a>
                            </li>
                            <li>
                                <a className="hover:text-primary" href="#">
                                    Careers
                                </a>
                            </li>
                            <li>
                                <a className="hover:text-primary" href="#">
                                    Blog
                                </a>
                            </li>
                            <li>
                                <a className="hover:text-primary" href="#">
                                    Contact
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="mb-4 text-sm font-bold text-[#111418]">For Customers</h3>
                        <ul className="flex flex-col gap-2 text-sm text-[#617589]">
                            <li>
                                <a className="hover:text-primary" href="#">
                                    How it Works
                                </a>
                            </li>
                            <li>
                                <a className="hover:text-primary" href="#">
                                    Safety
                                </a>
                            </li>
                            <li>
                                <a className="hover:text-primary" href="#">
                                    Service Guarantee
                                </a>
                            </li>
                            <li>
                                <a className="hover:text-primary" href="#">
                                    Help Center
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="mb-4 text-sm font-bold text-[#111418]">
                            For Professionals
                        </h3>
                        <ul className="flex flex-col gap-2 text-sm text-[#617589]">
                            <li>
                                <a className="hover:text-primary" href="#">
                                    Become a Pro
                                </a>
                            </li>
                            <li>
                                <a className="hover:text-primary" href="#">
                                    Success Stories
                                </a>
                            </li>
                            <li>
                                <a className="hover:text-primary" href="#">
                                    Pro Resources
                                </a>
                            </li>
                            <li>
                                <a className="hover:text-primary" href="#">
                                    Community
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-between border-t border-[#f0f2f4] py-8 md:flex-row">
                    <p className="mb-4 text-xs text-[#617589] md:mb-0">
                        © 2026 HandyHub Inc. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-xs text-[#617589]">
                        <a className="hover:text-[#111418]" href="#">
                            Privacy
                        </a>
                        <a className="hover:text-[#111418]" href="#">
                            Terms
                        </a>
                        <a className="hover:text-[#111418]" href="#">
                            Sitemap
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
