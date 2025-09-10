import React, { useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import Navigation from "../../components/Navigation";

interface FAQItem {
    question: string;
    answer: React.ReactNode;
}

const faqData: FAQItem[] = [
    {
        question: "Jak działa walidacja nazw kategorii?",
        answer: (
            <div>
                <p>System sprawdza, czy nazwy kategorii i podkategorii:</p>
                <ul className="list-disc ml-6 mt-2">
                    <li>nie są puste,</li>
                    <li>nie zawierają niedozwolonych znaków (np. „."),</li>
                    <li>są unikalne w obrębie kolekcji.</li>
                </ul>
            </div>
        )
    },
    {
        question: "Czym różni się wyszukiwanie lokalne od globalnego?",
        answer: (
            <div>
                <p><strong>Lokalne</strong> – przeszukuje tylko jedną, wybraną kolekcję.</p>
                <p className="mt-2"><strong>Globalne</strong> – przeszukuje wszystkie kolekcje jednocześnie.</p>
                <p className="mt-2">W obu trybach dostępne są zakładki: "Szybkie wyszukiwanie" oraz "Zaawansowane wyszukiwanie".</p>
            </div>
        )
    },
    {
        question: "Czy mogę edytować strukturę już istniejącej kolekcji?",
        answer: (
            <div>
                <p>Tak, ale z ograniczeniami:</p>
                <ul className="list-disc ml-6 mt-2">
                    <li>można zmieniać nazwy kategorii i podkategorii,</li>
                    <li>można dodawać nowe kategorie/podkategorie, ale tylko na końcu istniejącej struktury,</li>
                    <li>nie można zmieniać kolejności kategorii,</li>
                    <li>nie można usuwać istniejących już kategorii (można usuwać tylko te dodane w bieżącej edycji).</li>
                </ul>
            </div>
        )
    },
    {
        question: "Dlaczego nie mogę zapisać kolekcji?",
        answer: (
            <div>
                <p>Sprawdź, czy:</p>
                <ul className="list-disc ml-6 mt-2">
                    <li>wszystkie wymagane pola są wypełnione (Nazwa, Opis + co najmniej jedna kategoria),</li>
                    <li>nie zostawiłaś pustych nazw kategorii,</li>
                    <li>nie występują błędy walidacji w formularzu (np. duplikaty nazw kategorii w obrębie jednej kolekcji, niedozwolony znak „." w nazwie).</li>
                </ul>
            </div>
        )
    },
    {
        question: "Dlaczego nie mogę dodać rekordu?",
        answer: (
            <div>
                <p>Sprawdź, czy formularz nie zawiera błędów walidacji – np. co najmniej jedno pole musi być wypełnione.</p>
            </div>
        )
    },
    {
        question: "Co zrobić, jeśli nie znajduję rekordu w wyszukiwarce?",
        answer: (
            <div>
                <ul className="list-disc ml-6 mt-2">
                    <li>upewnij się, że wyszukujesz w odpowiednim trybie (lokalnym lub globalnym),</li>
                    <li>sprawdź poprawność wpisanej frazy,</li>
                    <li>jeśli dzieło jest nowe, odśwież stronę.</li>
                </ul>
            </div>
        )
    },
    {
        question: "Jak usunąć kolekcję?",
        answer: (
            <div>
                <p>Na stronie głównej:</p>
                <ul className="list-disc ml-6 mt-2">
                    <li>zaznacz kolekcję (jedną lub kilka) przy pomocy checkboxa,</li>
                    <li>kliknij <strong>Usuń zaznaczone</strong>,</li>
                    <li>potwierdź w oknie dialogowym.</li>
                </ul>
                <p className="mt-2">⚠️ Usuniętej kolekcji nie da się przywrócić.</p>
            </div>
        )
    },
    {
        question: "Jak usunąć rekord?",
        answer: (
            <div>
                <p>Na stronie kolekcji zaznacz rekord (lub kilka) i kliknij <strong>Usuń zaznaczone</strong>, następnie potwierdź w popupie. Lub: na stronie rekordu kliknij <strong>Usuń</strong> i potwierdź w oknie dialogowym.</p>
                <p className="mt-2">⚠️ Usuniętego rekordu nie da się przywrócić.</p>
            </div>
        )
    },
    {
        question: "Dlaczego widzę tylko kilka kategorii na liście rekordów?",
        answer: (
            <div>
                <p>Domyślnie wyświetlane są tylko 3 pierwsze kategorie. Aby to zmienić:</p>
                <img src={`${process.env.PUBLIC_URL}/help/wyświetlane-kategorie.png`} alt="Wyświetlane kategorie" className="my-4 rounded-lg shadow-md border" />
                <ul className="list-disc ml-6 mt-2">
                    <li>użyj kontrolki <strong>Wyświetlane kategorie</strong>,</li>
                    <li>zaznacz w rozwijanej liście kategorie, które chcesz widzieć na liście rekordów (możesz wyszukać kategorię w polu wyszukiwania wewnątrz kontrolki),</li>
                    <li>aby wyświetlić wszystkie kategorie, wybierz <strong>Zaznacz wszystko</strong>,</li>
                    <li>aby usunąć zaznaczenia, wybierz <strong>Odznacz wszystko</strong>.</li>
                </ul>
                <p className="mt-2">⚠️ Co najmniej jedna kategoria musi być wybrana.</p>
            </div>
        )
    },
    {
        question: "Jak wyświetlić podkategorie dla rekordu?",
        answer: (
            <div>
                <p>Na stronie rekordu, obok kategorii posiadającej podkategorie znajduje się przycisk <strong>+</strong>. Kliknij, aby rozwinąć listę podkategorii. Aby zwinąć, kliknij <strong>–</strong>.</p>
                <img src={`${process.env.PUBLIC_URL}/help/rozwijanie-podkategorii.png`} alt="Rozwijanie podkategorii" className="my-4 rounded-lg shadow-md border" />
            </div>
        )
    },
    {
        question: "Jak zmienić sortowanie listy rekordów?",
        answer: (
            <div>
                <p>Skorzystaj z kontrolki <strong>Sortowanie według</strong>. Wybierz kategorię, według której chcesz sortować listę. Kliknij ikonę strzałki, aby zmienić kierunek sortowania (▲ rosnąco, ▼ malejąco).</p>
                <img src={`${process.env.PUBLIC_URL}/help/sortowanie.png`} alt="Sortowanie" className="my-4 rounded-lg shadow-md border" />
            </div>
        )
    },
    {
        question: "Dlaczego nie widzę nowo utworzonej kolekcji?",
        answer: (
            <div>
                <p>Jeżeli kolekcja została poprawnie utworzona, powinna pojawić się na liście kolekcji na stronie głównej. Lista jest stronicowana, dlatego nowa kolekcja może znajdować się na dalszej stronie. Aby ją zobaczyć, skorzystaj z przycisków ze strzałkami pod listą kolekcji, aby przejść do kolejnych stron.</p>
            </div>
        )
    }
];

const HelpPage: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const base = process.env.PUBLIC_URL;

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main content */}
                    <div className="lg:col-span-3">
                        <Navigation />

                        {/* === INSTRUKCJA === */}
                        <section id="instrukcja" className="mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Instrukcja korzystania z Ethnopedii</h2>

                            {/* Wprowadzenie */}
                            <div id="wstep" className="mb-8">
                                <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">1. Wprowadzenie</h3>
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                                        Ethnopedia to system stworzony z myślą o etnomuzykologach, którzy potrzebują wygodnego i intuicyjnego narzędzia do gromadzenia danych w trakcie badań. Jest to rekonfigurowalny system do zarządzania metadanymi tekstowymi, który służy do przechowywania, opisywania i wyszukiwania dzieł oraz kolekcji.
                                    </p>
                                    <p className="text-gray-700 dark:text-gray-300 mb-4">Dzięki Ethnopedii można:</p>
                                    <ul className="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300 mb-4">
                                        <li>tworzyć kolekcje dzieł z własną strukturą metadanych,</li>
                                        <li>dodawać i szczegółowo opisywać dzieła,</li>
                                        <li>wyszukiwać dane w obrębie jednej kolekcji lub we wszystkich kolekcjach jednocześnie,</li>
                                        <li>wygodnie edytować i aktualizować informacje,</li>
                                        <li>importować i eksportować dane z/do pliku Excel,</li>
                                        <li>przechowywać pliki powiązane z dziełem (np. MIDI, MEI).</li>
                                    </ul>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Elastyczna struktura systemu pozwala użytkownikowi samodzielnie ustalić nazwy pól i hierarchię metadanych, dzięki czemu Ethnopedia może być wykorzystywana nie tylko w badaniach muzycznych, lecz także w innych dziedzinach wymagających systematycznego opisu i analizy danych.
                                    </p>
                                </div>
                            </div>

                            {/* Kolekcje */}
                            <div id="kolekcje" className="mb-8">
                                <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">2. Kolekcje</h3>

                                {/* Tworzenie kolekcji */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
                                    <h4 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-4">2.1 Tworzenie kolekcji</h4>

                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-gray-700 dark:text-gray-300 mb-3">1. Na stronie głównej kliknij przycisk „+ Nowa kolekcja".</p>
                                            <img src={`${base}/help/dodawanie-kolekcji-1.png`} alt="Dodawanie kolekcji krok 1" className="rounded-lg shadow-md border max-w-full h-auto" />
                                        </div>

                                        <div>
                                            <p className="text-gray-700 dark:text-gray-300 mb-3">2. Wprowadź podstawowe informacje:</p>
                                            <ul className="list-disc ml-6 mb-3 text-gray-700 dark:text-gray-300">
                                                <li>Nazwa kolekcji – np. „Nagrania z Podlasia 1975–1980"</li>
                                                <li>Opis kolekcji – np. „Zbiór nagrań terenowych dotyczących muzyki weselnej z północnego Podlasia"</li>
                                            </ul>
                                            <img src={`${base}/help/dodawanie-kolekcji-2.png`} alt="Dodawanie kolekcji krok 2" className="rounded-lg shadow-md border max-w-full h-auto" />
                                        </div>

                                        <div>
                                            <p className="text-gray-700 dark:text-gray-300 mb-3">3. Zaprojektuj strukturę metadanych:</p>
                                            <ul className="list-disc ml-6 mb-3 text-gray-700 dark:text-gray-300">
                                                <li>Każda kolekcja ma własny układ pól, zwanych kategoriami (np. „Wykonawca", „Miejscowość", „Rok nagrania", „Rodzaj utworu").</li>
                                                <li>Użytkownik może sam nazwać kategorie i ustalić ich liczbę.</li>
                                                <li>Kategorie można układać hierarchicznie (np. „Wykonawca → Data urodzenia" i „Wykonawca → Miejsce urodzenia").</li>
                                                <li>Kategoria nadrzędna, nawet jeśli posiada podkategorie, również przyjmuje własną wartość.</li>
                                            </ul>
                                            <img src={`${base}/help/dodawanie-kolekcji-3.png`} alt="Dodawanie kolekcji krok 3" className="rounded-lg shadow-md border max-w-full h-auto mb-4" />

                                            <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Tworzenie struktury metadanych krok po kroku:</h5>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>Dodawanie kategorii:</strong> wpisz nazwę w polu tekstowym i kliknij „+ Dodaj kategorię", aby dodać kolejne pole.</p>
                                                    <img src={`${base}/help/dodawanie-kolekcji-3-1.png`} alt="Dodawanie kategorii" className="rounded-lg shadow-md border max-w-full h-auto" />
                                                </div>

                                                <div>
                                                    <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>Dodawanie podkategorii:</strong> najedź myszką na kategorię, po prawej stronie obok pola kliknij ikonę +, aby dodać podkategorię poniżej wybranej kategorii.</p>
                                                    <img src={`${base}/help/dodawanie-kolekcji-3-2.png`} alt="Dodawanie podkategorii" className="rounded-lg shadow-md border max-w-full h-auto" />
                                                </div>

                                                <div>
                                                    <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>Usuwanie kategorii:</strong> najedź na kategorię i kliknij ikonę kosza po prawej stronie pola.</p>
                                                    <img src={`${base}/help/dodawanie-kolekcji-3-3.png`} alt="Usuwanie kategorii" className="rounded-lg shadow-md border max-w-full h-auto" />
                                                </div>

                                                <div>
                                                    <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>Zmiana kolejności kategorii:</strong> kliknij i przytrzymaj ikonę trzech kropek po prawej stronie pola, przeciągnij kategorię w nowe miejsce.</p>
                                                    <img src={`${base}/help/dodawanie-kolekcji-3-4.png`} alt="Zmiana kolejności kategorii" className="rounded-lg shadow-md border max-w-full h-auto" />
                                                </div>
                                            </div>

                                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4">
                                                <p className="text-yellow-800 dark:text-yellow-200"><strong>Uwaga:</strong> przesuwanie działa tylko w obrębie tego samego poziomu hierarchii. Aby przenieść kategorię na inny poziom, usuń ją i dodaj ponownie w odpowiednim miejscu.</p>
                                            </div>

                                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                                                <p className="text-blue-800 dark:text-blue-200"><strong>Ważne:</strong> zaprojektowana struktura metadanych obowiązuje wszystkie rekordy w kolekcji.</p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-gray-700 dark:text-gray-300 mb-3">4. Aby zapisać
                                                kolekcję, kliknij przycisk „Utwórz" na dole ekranu.</p>
                                            <img src={`${base}/help/dodawanie-kolekcji-4.png`}
                                                 alt="Dodawanie kolekcji krok 4"
                                                 className="rounded-lg shadow-md border max-w-full h-auto"/>
                                        </div>
                                        <div>
                                            <p className="text-gray-700 dark:text-gray-300 mb-3">Po utworzeniu, nowa
                                                kolekcja pojawi się na liście kolekcji na stronie głównej.</p>
                                            <img src={`${base}/help/dodawanie-kolekcji-5.png`}
                                                 alt="Dodawanie kolekcji krok 5"
                                                 className="rounded-lg shadow-md border max-w-full h-auto"/>
                                        </div>
                                    </div>
                                </div>

                                {/* Edycja kolekcji */}
                                <div id="kolekcje edycja" className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
                                    <h4 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-4">2.2 Edycja kolekcji</h4>
                                    <div className="space-y-4">
                                        <p className="text-gray-700 dark:text-gray-300">1. Na stronie kolekcji kliknij przycisk „Edytuj" po prawej stronie od nazwy kolekcji.</p>
                                        <img src={`${base}/help/edycja-kolekcji.png`} alt="Edycja kolekcji" className="rounded-lg shadow-md border max-w-full h-auto" />
                                        <div>
                                            <p className="text-gray-700 dark:text-gray-300 mb-2">2. Na stronie edycji możesz:</p>
                                            <ul className="list-disc ml-6 text-gray-700 dark:text-gray-300">
                                                <li>zmienić nazwę i opis kolekcji,</li>
                                                <li>zmienić nazwy kategorii i podkategorii,</li>
                                                <li>dodać nowe kategorie, ale tylko na końcu istniejącej struktury metadanych.</li>
                                            </ul>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300">Jeśli zmienisz strukturę (np. dodasz nową kategorię), zmiany będą widoczne we wszystkich rekordach tej kolekcji.</p>
                                    </div>
                                </div>

                                {/* Cofanie i przywracanie zmian */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                                    <h4 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-4">2.3 Cofanie i przywracanie zmian</h4>
                                    <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300">
                                        <li>Każda zmiana w formularzu (np. wpisanie tekstu, dodanie kategorii) jest zapisywana w historii.</li>
                                        <li><strong>Cofanie zmiany:</strong> użyj Ctrl+Z lub przycisku ze strzałką na dolnym pasku narzędzi.</li>
                                        <li><strong>Przywracanie cofniętej zmiany:</strong> użyj Ctrl+Y lub przycisku ze strzałką na dolnym pasku narzędzi.</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Rekordy */}
                            <div id="rekordy" className="mb-8">
                                <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">3. Rekordy</h3>

                                {/* Dodawanie rekordu */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
                                    <h4 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-4">3.1 Dodawanie rekordu</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-gray-700 dark:text-gray-300 mb-3">1. Na stronie kolekcji,
                                                do której chcesz dodać dzieło/metadane, kliknij przycisk „+ Nowy
                                                rekord".</p>
                                            <img src={`${base}/help/dodawanie-rekordu-1.png`}
                                                 alt="Dodawanie rekordu krok 1"
                                                 className="rounded-lg shadow-md border max-w-full h-auto"/>
                                        </div>

                                        <div>
                                            <p className="text-gray-700 dark:text-gray-300 mb-3">2. Uzupełnij pola
                                                formularza odpowiednimi wartościami dla każdej kategorii.</p>
                                            <ul className="list-disc ml-6 mb-3 text-gray-700 dark:text-gray-300">
                                                <li>Po kliknięciu w pole tekstowe wyświetlają się propozycje
                                                    autouzupełnienia na podstawie istniejących już w kolekcji rekordów.
                                                </li>
                                                <li>Aby zatwierdzić sugestię, kliknij ją myszką lub wybierz strzałkami
                                                    na klawiaturze i zatwierdź klawiszem Tab.
                                                </li>
                                            </ul>
                                        </div>

                                        <div>
                                            <p className="text-gray-700 dark:text-gray-300 mb-3">3. Aby dodać pliki
                                                powiązane z rekordem, kliknij pole do przesyłania plików i wybierz plik
                                                z lokalnego systemu.</p>
                                            <ul className="list-disc ml-6 mb-3 text-gray-700 dark:text-gray-300">
                                                <li>Obsługiwane formaty: mei, midi, musicxml, xml, wav, mp3, txt</li>
                                                <li>Maksymalny rozmiar pliku: 25 MB</li>
                                            </ul>
                                            <img src={`${base}/help/dodawanie-rekordu-2.png`}
                                                 alt="Dodawanie rekordu krok 2"
                                                 className="rounded-lg shadow-md border max-w-full h-auto"/>
                                        </div>

                                        <p className="text-gray-700 dark:text-gray-300">4. Aby zapisać rekord w
                                            kolekcji, kliknij „Utwórz".</p>
                                        <img src={`${base}/help/dodawanie-rekordu-3.png`}
                                             alt="Dodawanie rekordu krok 3"
                                             className="rounded-lg shadow-md border max-w-full h-auto"/>
                                    </div>
                                </div>

                                {/* Edycja rekordu */}
                                <div id="rekordy edycja" className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
                                    <h4 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-4">3.2 Edycja rekordu</h4>
                                    <ol className="list-decimal ml-6 space-y-2 text-gray-700 dark:text-gray-300">
                                        <li>Na stronie rekordu kliknij przycisk „Edytuj".</li>
                                        <li>Możesz zmieniać wszystkie pola formularza tak samo jak przy dodawaniu nowego rekordu.</li>
                                        <li>Możesz również dodawać lub usuwać pliki powiązane z rekordem.</li>
                                        <li>Aby zachować zmiany, kliknij „Zapisz".</li>
                                    </ol>
                                </div>

                                {/* Cofanie i przywracanie zmian dla rekordów */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                                    <h4 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-4">3.3 Cofanie i przywracanie zmian</h4>
                                    <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300">
                                        <li>Każda zmiana w formularzu (np. wpisanie tekstu) jest zapisywana w historii.</li>
                                        <li><strong>Cofanie zmiany:</strong> użyj Ctrl+Z lub przycisku ze strzałką na dolnym pasku narzędzi.</li>
                                        <li><strong>Przywracanie cofniętej zmiany:</strong> użyj Ctrl+Y lub przycisku ze strzałką na dolnym pasku narzędzi.</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Wyszukiwanie */}
                            <div id="wyszukiwanie" className="mb-8">
                                <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">4. Wyszukiwanie</h3>

                                {/* Wyszukiwanie lokalne */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
                                    <h4 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-4">4.1 Wyszukiwanie lokalne</h4>
                                    <p className="text-gray-700 dark:text-gray-300 mb-4">Na stronie wybranej kolekcji znajduje się obszar wyszukiwania pod nazwą i opisem kolekcji. Dostępne są dwie zakładki: "Szybkie wyszukiwanie" i "Zaawansowane wyszukiwanie".</p>

                                    <div className="space-y-4">
                                        <div>
                                            <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Szybkie wyszukiwanie:</h5>
                                            <ul className="list-disc ml-6 mb-3 text-gray-700 dark:text-gray-300">
                                                <li>Wpisz frazę w polu wyszukiwania.</li>
                                                <li>System przeszuka wszystkie metadane w obrębie kolekcji.</li>
                                                <li>Po kliknięciu „Wyszukaj" lista rekordów zostanie ograniczona do tych, które spełniają warunek wyszukiwania.</li>
                                            </ul>
                                            <img src={`${base}/help/wyszukiwanie-szybkie.png`} alt="Wyszukiwanie szybkie" className="rounded-lg shadow-md border max-w-full h-auto" />
                                        </div>

                                        <div>
                                            <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Zaawansowane
                                                wyszukiwanie:</h5>
                                            <ul className="list-disc ml-6 mb-3 text-gray-700 dark:text-gray-300 space-y-2">
                                                <li>Umożliwia wyszukiwanie po konkretnych kategoriach.</li>
                                                <li>
                                                    Aby dodać regułę wyszukiwania:
                                                    <ul className="list-[circle] ml-6 mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                                                        <li>Wybierz kategorię z rozwijanej listy.</li>
                                                        <li>Wpisz szukaną frazę dla wybranej kategorii.</li>
                                                        <li>Kliknij „+ Dodaj regułę".</li>
                                                    </ul>
                                                </li>
                                                <li>Aby uruchomić wyszukiwanie, kliknij „Wyszukaj".</li>
                                            </ul>

                                            <img src={`${base}/help/wyszukiwanie-zaawansowane-1.png`}
                                                 alt="Wyszukiwanie zaawansowane 1"
                                                 className="rounded-lg shadow-md border max-w-full h-auto mb-4"/>
                                            <img src={`${base}/help/wyszukiwanie-zaawansowane-2.png`}
                                                 alt="Wyszukiwanie zaawansowane 2"
                                                 className="rounded-lg shadow-md border max-w-full h-auto mb-4"/>
                                            <img src={`${base}/help/wyszukiwanie-zaawansowane-3.png`}
                                                 alt="Wyszukiwanie zaawansowane 3"
                                                 className="rounded-lg shadow-md border max-w-full h-auto mb-4"/>

                                            <ul className="list-disc ml-6 mb-3 text-gray-700 dark:text-gray-300">
                                                <li>Możesz dodać kilka reguł dla różnych kategorii – wówczas wyniki
                                                    wyszukiwania pokażą tylko rekordy spełniające wszystkie reguły
                                                    (koniunkcja).
                                                </li>
                                            </ul>
                                            <img src={`${base}/help/wyszukiwanie-zaawansowane-4.png`}
                                                 alt="Wyszukiwanie zaawansowane 4"
                                                 className="rounded-lg shadow-md border max-w-full h-auto"/>
                                        </div>
                                    </div>
                                </div>

                                {/* Wyszukiwanie globalne */}
                                <div id="wyszukiwanie globalne" className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
                                    <h4 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-4">4.2
                                        Wyszukiwanie globalne</h4>
                                    <div className="space-y-4">
                                        <p className="text-gray-700 dark:text-gray-300">Aby przejść do wyszukiwania
                                            globalnego, kliknij ikonę lupy na górnym pasku aplikacji.</p>
                                        <img src={`${base}/help/wyszukiwanie-globalne-1.png`}
                                             alt="Wyszukiwanie globalne 1"
                                             className="rounded-lg shadow-md border max-w-full h-auto"/>

                                        <p>Możesz wybrać, w których kolekcjach chcesz wyszukiwać, korzystając z
                                                rozwijanej listy. Domyślnie zaznaczone są wszystkie kolekcje.</p>
                                        <img src={`${base}/help/wyszukiwanie-globalne-2.png`}
                                             alt="Wyszukiwanie globalne 2"
                                             className="rounded-lg shadow-md border max-w-full h-auto"/>

                                        <p>Na stronie wyszukiwania globalnego dostępne są dwie zakładki: "Szybkie
                                            wyszukiwanie" i "Zaawansowane wyszukiwanie", tak jak w wyszukiwaniu lokalnym.
                                        </p>
                                        <ul className="list-disc ml-6 text-gray-700 dark:text-gray-300">
                                            <li><strong>Szybkie wyszukiwanie:</strong> przeszukuje wszystkie metadane w
                                                wybranych kolekcjach.
                                            </li>
                                            <li><strong>Zaawansowane wyszukiwanie:</strong> pozwala ustalić reguły dla
                                                konkretnych kategorii w wybranych kolekcjach. Można dodać kilka reguł, a
                                                wyniki pokażą rekordy spełniające wszystkie warunki.
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Import */}
                            <div id="importowanie" className="mb-8">
                                <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">5.
                                    Importowanie danych</h3>
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
                                    <h4 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-4">5.1 Importowanie z pliku Excel</h4>
                                {/*    TODO*/}
                                </div>
                            </div>

                            {/* Export */}
                            <div id="eksportowanie" className="mb-8">
                                <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">6.
                                    Eksportowanie danych</h3>
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
                                    <h4 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-4">6.1
                                        Eksportowanie do pliku Excel</h4>
                                    {/*    TODO*/}
                                </div>
                            </div>
                        </section>

                        {/* === FAQ === */}
                        <section id="faq" className="mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Najczęstsze pytania
                                (FAQ)</h2>
                            <div className="space-y-4">
                                {faqData.map((item, idx) => (
                                    <div key={idx}
                                         className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border overflow-hidden">
                                    <button
                                            aria-expanded={openIndex === idx}
                                            aria-controls={`faq-${idx}`}
                                            className="w-full text-left px-6 py-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 flex justify-between items-center"
                                            onClick={() => toggleFAQ(idx)}
                                        >
                                            <span className="font-semibold text-gray-900 dark:text-white pr-4">{item.question}</span>
                                            <span className="text-2xl text-gray-500 dark:text-gray-400 font-light flex-shrink-0">
                                                {openIndex === idx ? "−" : "+"}
                                            </span>
                                        </button>
                                        {openIndex === idx && (
                                            <div
                                                id={`faq-${idx}`}
                                                className="px-6 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-600"
                                            >
                                                {item.answer}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                                Jeśli nie znalazłeś odpowiedzi, skontaktuj się z administratorem systemu.
                            </div>
                        </section>
                    </div>

                    {/* Sidebar - Table of Contents */}
                    <aside className="hidden lg:block lg:col-span-1">
                    <div className="sticky top-8">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Spis treści</h3>
                                <nav className="text-sm space-y-2">
                                    <a href="#wstep"
                                       className="block text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                                        1. Wprowadzenie
                                    </a>
                                    <a href="#kolekcje"
                                       className="block text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                                        2. Kolekcje
                                    </a>
                                    <div className="ml-4 space-y-1">
                                        <a href="#kolekcje"
                                           className="block text-gray-500 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 transition-colors text-xs">
                                            2.1 Tworzenie kolekcji
                                        </a>
                                        <a href="#kolekcje edycja"
                                           className="block text-gray-500 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 transition-colors text-xs">
                                            2.2 Edycja kolekcji
                                        </a>
                                    </div>
                                    <a href="#rekordy"
                                       className="block text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                                        3. Rekordy
                                    </a>
                                    <div className="ml-4 space-y-1">
                                        <a href="#rekordy"
                                           className="block text-gray-500 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 transition-colors text-xs">
                                            3.1 Dodawanie rekordu
                                        </a>
                                        <a href="#rekordy edycja"
                                           className="block text-gray-500 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 transition-colors text-xs">
                                            3.2 Edycja rekordu
                                        </a>
                                    </div>
                                    <a href="#wyszukiwanie"
                                       className="block text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                                        4. Wyszukiwanie
                                    </a>
                                    <div className="ml-4 space-y-1">
                                        <a href="#wyszukiwanie"
                                           className="block text-gray-500 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 transition-colors text-xs">
                                            4.1 Wyszukiwanie lokalne
                                        </a>
                                        <a href="#wyszukiwanie globalne"
                                           className="block text-gray-500 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 transition-colors text-xs">
                                            4.2 Wyszukiwanie globalne
                                        </a>
                                    </div>
                                    <a href="#importowanie"
                                       className="block text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                                        5. Importowanie
                                    </a>
                                    <a href="#eksportowanie"
                                       className="block text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                                        6. Eksportowanie
                                    </a>
                                    <a href="#faq"
                                       className="block text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                                        7. FAQ
                                    </a>
                                </nav>
                            </div>
                    </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default HelpPage;
