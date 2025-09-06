import React, { useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import Navigation from "../../components/Navigation";

interface FAQItem {
    question: string;
    answer: React.ReactNode;
}

const faqData: FAQItem[] = [
    {
        question: "Jak można nazywać kategorie?",
        answer: (
            <div>
                <p>System sprawdza, czy nazwy kategorii i podkategorii:</p>
                <ul className="list-disc ml-6 mt-2">
                    <li>nie są puste,</li>
                    <li>nie zawierają niedozwolonych znaków (np. „.”),</li>
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
                <p className="mt-2"><strong>Globalne</strong> – przeszukuje wszystkie kolekcje jednocześnie. W obu trybach dostępne są zakładki: Szybkie wyszukiwanie oraz Zaawansowane wyszukiwanie.</p>
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
                    <li>nie występują błędy walidacji w formularzu (np. duplikaty nazw kategorii w obrębie jednej kolekcji, niedozwolony znak „.” w nazwie).</li>
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
        question: "Dlaczego widzę tylko 3 kategorie na liście rekordów?",
        answer: (
            <div>
                <p>Domyślnie wyświetlane są tylko trzy pierwsze kategorie. Aby to zmienić:</p>
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
            </div>
        )
    },
    {
        question: "Jak zmienić sortowanie listy rekordów?",
        answer: (
            <div>
                <p>Skorzystaj z kontrolki <strong>Sortowanie według</strong>. Wybierz kategorię, według której chcesz sortować listę. Kliknij ikonę strzałki, aby zmienić kierunek sortowania (▲ rosnąco, ▼ malejąco).</p>
            </div>
        )
    }
];

const HelpPage: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="flex flex-col min-h-screen" data-testid="collections-page-container">
            <Navbar />

            <main className="p-6 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left: main content (3/4 on large screens) */}
                <div className="lg:col-span-3">
                    <Navigation />

                    <h1 className="text-3xl font-bold mt-2 mb-6">Pomoc i FAQ</h1>

                    {/* Wstęp */}
                    <section id="wstep" className="mb-6">
                        <h2 className="text-2xl font-semibold mb-3">Instrukcja korzystania z Ethnopedii</h2>
                        <h3 className="text-lg font-semibold mt-2">1. Wprowadzenie</h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">Ethnopedia to system stworzony z myślą o etnomuzykologach, którzy potrzebują wygodnego i intuicyjnego narzędzia do gromadzenia danych w trakcie badań.</p>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-2">Jest to rekonfigurowalny system do zarządzania metadanymi tekstowymi, który służy do przechowywania, opisywania i wyszukiwania dzieł oraz kolekcji.</p>
                        <p className="mt-3 text-gray-700 dark:text-gray-300 leading-relaxed">Dzięki Ethnopedii można:</p>
                        <ul className="list-disc ml-6 mt-2 text-gray-700 dark:text-gray-300">
                            <li>tworzyć kolekcje dzieł z własną strukturą metadanych,</li>
                            <li>dodawać i szczegółowo opisywać dzieła,</li>
                            <li>wyszukiwać dane w obrębie jednej kolekcji lub we wszystkich kolekcjach jednocześnie,</li>
                            <li>wygodnie edytować i aktualizować informacje,</li>
                            <li>importować i eksportować dane z/do pliku Excel,</li>
                            <li>przechowywać pliki powiązane z dziełem (np. MIDI, MEI).</li>
                        </ul>
                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">Elastyczna struktura systemu pozwala użytkownikowi samodzielnie ustalić nazwy pól i hierarchię metadanych, dzięki czemu Ethnopedia może być wykorzystywana nie tylko w badaniach muzycznych, lecz także w innych dziedzinach wymagających systematycznego opisu i analizy danych.</p>
                    </section>

                    {/* Kolekcje */}
                    <section id="kolekcje" className="mb-6">
                        <h2 className="text-2xl font-semibold mb-3">2. Kolekcje</h2>
                        <h3 className="text-lg font-semibold mt-2">2.1 Tworzenie kolekcji</h3>
                        <p className="text-gray-700 dark:text-gray-300 mt-2">Na stronie głównej kliknij przycisk „+ Nowa kolekcja”.</p>

                        <p className="mt-3 font-semibold">Wprowadź podstawowe informacje:</p>
                        <ul className="list-disc ml-6 mt-2 text-gray-700 dark:text-gray-300">
                            <li>Nazwa kolekcji – np. „Nagrania z Podlasia 1975–1980”</li>
                            <li>Opis kolekcji – np. „Zbiór nagrań terenowych dotyczących muzyki weselnej z północnego Podlasia”</li>
                        </ul>

                        <p className="mt-3 font-semibold">Zaprojektuj strukturę metadanych:</p>
                        <p className="text-gray-700 dark:text-gray-300 mt-2">Każda kolekcja ma własny układ pól, zwanych kategoriami (np. „Wykonawca”, „Miejscowość”, „Rok nagrania”, „Rodzaj utworu”).</p>
                        <p className="text-gray-700 dark:text-gray-300 mt-2">Użytkownik może sam nazwać kategorie i ustalić ich liczbę.</p>
                        <p className="text-gray-700 dark:text-gray-300 mt-2">Kategorie można układać hierarchicznie (np. „Wykonawca → Imię” i „Wykonawca → Nazwisko”).</p>

                        <h4 className="font-semibold mt-3">Tworzenie struktury metadanych krok po kroku:</h4>
                        <ul className="list-disc ml-6 mt-2 text-gray-700 dark:text-gray-300">
                            <li>Dodawanie kategorii: wpisz nazwę w polu tekstowym i kliknij „+ Dodaj kategorię”, aby dodać kolejne pole.</li>
                            <li>Dodawanie podkategorii: najedź myszką na kategorię, po prawej stronie obok pola kliknij ikonę +, aby dodać podkategorię poniżej wybranej kategorii.</li>
                            <li>Usuwanie kategorii: najedź na kategorię i kliknij ikonę kosza po prawej stronie pola.</li>
                            <li>Zmiana kolejności kategorii: kliknij i przytrzymaj ikonę trzech kropek po prawej stronie pola, przeciągnij kategorię w nowe miejsce.</li>
                        </ul>

                        <p className="mt-3 text-gray-700 dark:text-gray-300">Uwaga: przesuwanie działa tylko w obrębie tego samego poziomu hierarchii. Aby przenieść kategorię na inny poziom, usuń ją i dodaj ponownie w odpowiednim miejscu.</p>

                        <p className="mt-3 text-gray-700 dark:text-gray-300">Ważne: zaprojektowana struktura metadanych obowiązuje wszystkie rekordy w kolekcji.</p>

                        <p className="mt-3 text-gray-700 dark:text-gray-300">Aby zapisać i utworzyć kolekcję, kliknij przycisk „Utwórz” na dole ekranu.</p>

                        <h3 className="font-semibold mt-4">2.2 Edycja kolekcji</h3>
                        <p className="text-gray-700 dark:text-gray-300 mt-2">Na stronie kolekcji kliknij przycisk „Edytuj” po prawej stronie od nazwy kolekcji.</p>

                        <p className="mt-3">Na stronie edycji możesz:</p>
                        <ul className="list-disc ml-6 mt-2 text-gray-700 dark:text-gray-300">
                            <li>zmienić nazwę i opis kolekcji,</li>
                            <li>zmienić nazwy kategorii i podkategorii,</li>
                            <li>dodać nowe kategorie na końcu istniejącej struktury metadanych.</li>
                        </ul>

                        <p className="mt-3 text-gray-700 dark:text-gray-300">Jeśli zmienisz strukturę (np. dodasz nową kategorię), zmiany będą widoczne we wszystkich rekordach tej kolekcji.</p>

                        <h3 className="font-semibold mt-4">3.3 Cofanie i przywracanie zmian</h3>
                        <p className="text-gray-700 dark:text-gray-300 mt-2">Każda zmiana w formularzu (np. wpisanie tekstu, dodanie kategorii) jest zapisywana w historii.</p>
                        <p className="mt-2">Cofanie zmiany: użyj <strong>Ctrl+Z</strong> lub przycisku ze strzałką na dolnym pasku narzędzi.</p>
                        <p className="mt-2">Przywracanie cofniętej zmiany: użyj <strong>Ctrl+Y</strong> lub przycisku ze strzałką na dolnym pasku narzędzi.</p>
                    </section>

                    {/* Rekordy */}
                    <section id="rekordy" className="mb-6">
                        <h2 className="text-2xl font-semibold mb-3">3. Rekordy</h2>

                        <h3 className="font-semibold mt-2">3.1 Dodawanie rekordu</h3>
                        <p className="text-gray-700 dark:text-gray-300 mt-2">Na stronie kolekcji, do której chcesz dodać dzieło/metadane, kliknij przycisk „+ Nowy rekord”.</p>

                        <ul className="list-disc ml-6 mt-2 text-gray-700 dark:text-gray-300">
                            <li>Uzupełnij pola formularza odpowiednimi wartościami dla każdej kategorii.</li>
                            <li>Po kliknięciu w pole tekstowe wyświetlają się propozycje autouzupełnienia na podstawie istniejących już w kolekcji rekordów.</li>
                            <li>Aby zatwierdzić sugestię, kliknij ją myszką lub wybierz strzałkami na klawiaturze i zatwierdź klawiszem Tab.</li>
                            <li>Aby dodać pliki powiązane z rekordem, kliknij pole do przesyłania plików i wybierz plik z lokalnego systemu.</li>
                            <li>Obsługiwane formaty: mei, midi, musicxml, xml, wav, mp3, txt</li>
                            <li>Maksymalny rozmiar pliku: 25 MB</li>
                            <li>Aby zapisać rekord w kolekcji, kliknij „Utwórz”.</li>
                        </ul>

                        <h3 className="font-semibold mt-3">3.2 Edycja rekordu</h3>
                        <p className="text-gray-700 dark:text-gray-300 mt-2">Na stronie rekordu kliknij przycisk „Edytuj”.</p>
                        <p className="mt-2 text-gray-700 dark:text-gray-300">Możesz zmieniać wszystkie pola formularza tak samo jak przy dodawaniu nowego rekordu. Możesz również dodawać lub usuwać pliki powiązane z rekordem.</p>
                        <p className="mt-2 text-gray-700 dark:text-gray-300">Aby zachować zmiany, kliknij „Zapisz”.</p>

                        <h3 className="font-semibold mt-3">3.3 Cofanie i przywracanie zmian</h3>
                        <p className="text-gray-700 dark:text-gray-300 mt-2">Każda zmiana w formularzu (np. wpisanie tekstu) jest zapisywana w historii.</p>
                        <p className="mt-2">Cofanie zmiany: użyj <strong>Ctrl+Z</strong> lub przycisku ze strzałką na dolnym pasku narzędzi.</p>
                        <p className="mt-2">Przywracanie cofniętej zmiany: użyj <strong>Ctrl+Y</strong> lub przycisku ze strzałką na dolnym pasku narzędzi.</p>
                    </section>

                    {/* Wyszukiwanie */}
                    <section id="wyszukiwanie" className="mb-6">
                        <h2 className="text-2xl font-semibold mb-3">4. Wyszukiwanie</h2>

                        <h3 className="font-semibold mt-2">4.1 Wyszukiwanie lokalne</h3>
                        <p className="text-gray-700 dark:text-gray-300 mt-2">Na stronie wybranej kolekcji znajduje się obszar wyszukiwania pod nazwą i opisem kolekcji. Dostępne są dwie zakładki: Szybkie wyszukiwanie i Zaawansowane wyszukiwanie.</p>

                        <p className="mt-2 font-semibold">Szybkie wyszukiwanie:</p>
                        <ul className="list-disc ml-6 mt-2 text-gray-700 dark:text-gray-300">
                            <li>Wpisz frazę w polu wyszukiwania.</li>
                            <li>System przeszuka wszystkie metadane w obrębie kolekcji.</li>
                            <li>Po kliknięciu „Wyszukaj” lista rekordów zostanie ograniczona do tych, które spełniają warunek wyszukiwania.</li>
                        </ul>

                        <p className="mt-3 font-semibold">Zaawansowane wyszukiwanie:</p>
                        <p className="text-gray-700 dark:text-gray-300 mt-2">Umożliwia wyszukiwanie po konkretnych kategoriach.</p>
                        <p className="mt-2">Aby dodać regułę wyszukiwania:</p>
                        <ul className="list-disc ml-6 mt-2 text-gray-700 dark:text-gray-300">
                            <li>Wybierz kategorię z rozwijanej listy.</li>
                            <li>Wpisz szukaną frazę dla wybranej kategorii.</li>
                            <li>Kliknij „+ Dodaj regułę”.</li>
                            <li>Możesz dodać kilka reguł dla różnych kategorii – wówczas wyniki wyszukiwania pokażą tylko rekordy spełniające wszystkie reguły (koniunkcja).</li>
                            <li>Aby uruchomić wyszukiwanie, kliknij „Wyszukaj”.</li>
                        </ul>

                        <h3 className="font-semibold mt-4">4.2 Wyszukiwanie globalne</h3>
                        <p className="text-gray-700 dark:text-gray-300 mt-2">Aby przejść do wyszukiwania globalnego, kliknij ikonę lupy na górnym pasku aplikacji.</p>
                        <p className="mt-2 text-gray-700 dark:text-gray-300">Możesz wybrać, w których kolekcjach chcesz wyszukiwać, korzystając z rozwijanej listy. Domyślnie zaznaczone są wszystkie kolekcje.</p>
                        <p className="mt-2 text-gray-700 dark:text-gray-300">Na stronie wyszukiwania globalnego dostępne są dwie zakładki: Szybkie wyszukiwanie i Zaawansowane wyszukiwanie, tak jak w wyszukiwaniu lokalnym.</p>
                        <p className="mt-2 text-gray-700 dark:text-gray-300">Szybkie wyszukiwanie: przeszukuje wszystkie metadane w wybranych kolekcjach.</p>
                        <p className="mt-2 text-gray-700 dark:text-gray-300">Zaawansowane wyszukiwanie: pozwala ustalić reguły dla konkretnych kategorii w wybranych kolekcjach. Można dodać kilka reguł, a wyniki pokażą rekordy spełniające wszystkie warunki.</p>
                    </section>

                    {/* Import / Eksport (TODO) */}
                    <section id="import" className="mb-6">
                        <h2 className="text-2xl font-semibold mb-3">5. Import danych</h2>
                        <p className="text-gray-700 dark:text-gray-300">TODO</p>
                    </section>

                    <section id="eksport" className="mb-6">
                        <h2 className="text-2xl font-semibold mb-3">6. Eksport danych</h2>
                        <p className="text-gray-700 dark:text-gray-300">TODO</p>
                    </section>

                    {/* FAQ as accordion */}
                    <section id="faq" className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">7. Najczęstsze pytania (FAQ)</h2>

                        {faqData.map((item, idx) => (
                            <div key={idx} className="mb-4 border rounded-lg overflow-hidden">
                                <button
                                    aria-expanded={openIndex === idx}
                                    aria-controls={`faq-${idx}`}
                                    className="w-full text-left px-4 py-3 bg-gray-100 dark:bg-gray-800 flex justify-between items-center"
                                    onClick={() => toggleFAQ(idx)}
                                >
                                    <span className="font-semibold">{item.question}</span>
                                    <span className="ml-2">{openIndex === idx ? "−" : "+"}</span>
                                </button>
                                {openIndex === idx && (
                                    <div id={`faq-${idx}`} className="px-4 py-3 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                                        {item.answer}
                                    </div>
                                )}
                            </div>
                        ))}

                        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">Jeśli nie znalazłeś odpowiedzi, skontaktuj się z administratorem systemu.</div>
                    </section>
                </div>

                {/* Right: table of contents / quick navigation */}
                <aside className="hidden lg:block lg:col-span-1 sticky top-20 self-start">
                    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                        <h3 className="font-semibold mb-3">Spis treści</h3>
                        <nav className="text-sm">
                            <ul className="space-y-2">
                                <li><a className="hover:underline" href="#wstep">Wstęp</a></li>
                                <li><a className="hover:underline" href="#kolekcje">Kolekcje</a></li>
                                <li><a className="hover:underline" href="#rekordy">Rekordy</a></li>
                                <li><a className="hover:underline" href="#wyszukiwanie">Wyszukiwanie</a></li>
                                <li><a className="hover:underline" href="#import">Import danych</a></li>
                                <li><a className="hover:underline" href="#eksport">Eksport danych</a></li>
                                <li><a className="hover:underline" href="#faq">FAQ</a></li>
                            </ul>
                        </nav>
                    </div>
                </aside>
            </main>
        </div>
    );
};

export default HelpPage;
