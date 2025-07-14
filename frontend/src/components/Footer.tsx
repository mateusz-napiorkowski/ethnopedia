import React from "react";
import PPLogo from '../assets/images/PP_znak_konturowy_CMYK.svg';
import KPO from '../assets/images/Znak_KPO_Poziom_RGB.png.png';
import RP from '../assets/images/Znak_barw_RP_linia_zamykajaca_Poziom_RGB.png';
import NGEU from '../assets/images/Znak_NextGenerationEU_Poziom_RGB.png.png';
import Dariah_PL from '../assets/images/logo-dariah.png';
import ISPAN from '../assets/images/Logotyp_ISPAN.png';

const Footer = () => {
    return (
        <section className="bg-white dark:bg-gray-800 py-10 w-full">
            <div
                className="max-w-screen-xl mx-auto px-4 lg:px-12 text-center text-gray-600 dark:text-gray-300 space-y-10">

                {/* Tekst o projekcie */}
                <div className="text-sm">
                    <p className="mb-2">
                        Narzędzie jest realizowane w ramach projektu{" "}
                        <a
                            href="https://www.dariah.pl"
                            className="text-primary-500 hover:text-primary-700"
                        >
                            Cyfrowa Infrastruktura Badawcza dla Humanistyki i Nauk o Sztuce DARIAH-PL
                        </a>{" "}
                        finansowanego z funduszy Krajowego Planu Odbudowy (KPOD.01.18-IW.03-0013/23) przez
                        Politechnikę Poznańską we współpracy z Instytutem Sztuki PAN.
                    </p>
                </div>

                {/* Główne logotypy */}
                <div className="flex flex-wrap justify-center items-center gap-16">
                    <img src={KPO} alt="Logo Krajowego Planu Odbudowy" className="h-20"/>
                    <img src={RP} alt="Logo Barw RP" className="h-20"/>
                    <img src={NGEU} alt="Logo NextGenerationEU" className="h-20"/>
                </div>
                <div className="flex flex-wrap justify-center items-center gap-16">
                    <img src={Dariah_PL} alt="Logo Dariah-PL" className="h-14"/>
                    <img src={PPLogo} alt="Logo Politechniki Poznańskiej" className="h-28"/>
                    <img src={ISPAN} alt="Logo Instytutu Sztuki Polskiej Akademi Nauk" className="h-10"/>
                </div>

                {/* Dolna sekcja */}
                <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                    <p>
                        &copy; {new Date().getFullYear()} Politechnika Poznańska – MusicPUT Team
                    </p>
                    <p>
                        Kontakt:{" "}
                        <a
                            href="mailto:dariah@cs.put.poznan.pl"
                            className="text-primary-500 hover:text-primary-700"
                        >
                            dariah@cs.put.poznan.pl
                        </a>
                    </p>
                </div>
            </div>
        </section>

    );
};

export default Footer;
