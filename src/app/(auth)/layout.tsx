import Image from "next/image";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#003DA5] via-[#0052CC] to-[#2563EB] relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-300/10 rounded-full blur-3xl" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
                    {/* Logo */}
                    <div className="mb-8">
                        <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                            <span className="text-3xl font-bold text-[#003DA5]">UTP</span>
                        </div>
                    </div>

                    <h1 className="text-4xl font-bold text-center mb-4">
                        Customer Support System
                    </h1>
                    <p className="text-lg text-blue-100 text-center max-w-md mb-8">
                        Get help quickly with our AI-powered support. Submit tickets, track progress, and get resolutions faster than ever.
                    </p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-4 max-w-md">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold mb-1">AI Chatbot</h3>
                            <p className="text-sm text-blue-100">Smart assistance 24/7</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            </div>
                            <h3 className="font-semibold mb-1">Track Tickets</h3>
                            <p className="text-sm text-blue-100">Real-time updates</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold mb-1">Fast Response</h3>
                            <p className="text-sm text-blue-100">SLA guaranteed</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold mb-1">Secure</h3>
                            <p className="text-sm text-blue-100">Data protected</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Auth Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
                <div className="w-full max-w-md">
                    {children}
                </div>
            </div>
        </div>
    );
}
