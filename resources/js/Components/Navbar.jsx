import React from 'react';
import { Link } from '@inertiajs/react';

export default function Navbar({ headerTitle }) {
    return (
        <>
            <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
                <div className="w-full flex flex-wrap items-center justify-between px-4 py-3 gap-4">
                    {/* Logo kiri */}
                    <div className="flex items-center flex-shrink-0 lg:block hidden">
                        <Link href="/" className="flex items-center gap-2">
                            <img
                                src="/assets/images/logo/Logo_of_Ministry_of_Education_and_Culture_of_Republic_of_Indonesia.svg.png"
                                alt="Kementerian Pendidikan Tinggi, Sains, dan Teknologi Republik Indonesia"
                                className="size-12 sm:size-14"
                            />
                            <p className="uppercase font-bold text-[9px] sm:text-[10px] leading-tight">
                                Kementerian Pendidikan Tinggi,<br /> Sains, dan Teknologi
                                <br /><span className="font-normal">Republik Indonesia</span>
                            </p>
                        </Link>
                    </div>

                    {/* Judul tengah */}
                    <div className="w-full text-center md:w-auto px-2">
                        <h2 className="text-[13px] sm:text-lg md:text-xl font-bold text-slate-800 leading-tight">
                            {headerTitle ? headerTitle : (
                                <>Dashboard Pemetaan Riset Berdampak di Seluruh Indonesia <span className="font-normal">(Beta)</span></>
                            )}
                        </h2>
                    </div>

                    {/* Logo kanan */}
                    <div className="lg:block hidden">
                        <div className="flex items-center justify-center md:justify-end gap-4 w-full md:w-auto">
                            <img src="/assets/images/logo/Ditjen Risbang.png" alt="Ditjen Risbang" className="w-20 h-auto" />
                            <div className="border-l-[1px] border-gray-500/30 h-10"></div>
                            <img
                                src="/assets/images/logo/Primary_Horizontal-Logo-1-1024x302.png"
                                alt="Logo Horizontal"
                                className="w-28 sm:w-32"
                            />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile logos */}
            <div className="lg:pt-0 pt-24">
                <div className="flex justify-center items-center flex-shrink-0 block lg:hidden">
                    <Link href="/" className="flex items-center gap-2">
                        <img
                            src="/assets/images/logo/Logo_of_Ministry_of_Education_and_Culture_of_Republic_of_Indonesia.svg.png"
                            alt="Kementerian Pendidikan Tinggi, Sains, dan Teknologi Republik Indonesia"
                            className="size-12 sm:size-14"
                        />
                        <p className="uppercase font-bold text-[9px] sm:text-[10px] leading-tight">
                            Kementerian Pendidikan Tinggi,<br /> Sains, dan Teknologi
                            <br /><span className="font-normal">Republik Indonesia</span>
                        </p>
                    </Link>
                </div>
                <div className="flex items-center justify-center md:justify-end gap-3 w-full lg:mt-0 mt-5 md:w-auto block lg:hidden">
                    <img src="/assets/images/logo/Ditjen Risbang.png" alt="Ditjen Risbang" className="w-20 h-auto" />
                    <img
                        src="/assets/images/logo/Primary_Horizontal-Logo-1-1024x302.png"
                        alt="Logo Horizontal"
                        className="w-28 sm:w-32"
                    />
                </div>
            </div>
        </>
    );
}
