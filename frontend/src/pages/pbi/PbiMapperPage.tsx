import React, { useMemo, useState } from "react"
import { useMutation, useQuery } from "react-query"
import { useParams } from "react-router-dom"
import Navbar from "../../components/navbar/Navbar"
import LoadingPage from "../LoadingPage"
import { getPbiCollectionPreview, getPbiStatus, previewPbiSync, startPbiSync } from "../../api/pbi"
import { PbiAnnotationMapping, PbiMapperConfig, PbiSyncResponse } from "../../@types/Pbi"
import { useUser } from "../../providers/UserProvider"

const defaultPredicateOptions = [
    "http://purl.org/dc/terms/identifier",
    "http://purl.org/dc/terms/title",
    "http://purl.org/dc/terms/description",
    "http://purl.org/dc/terms/spatial",
    "http://purl.org/dc/terms/created",
    "http://purl.org/dc/terms/subject"
]

const emptyMapping: PbiAnnotationMapping = {
    sourcePath: "",
    predicate: "http://purl.org/dc/terms/title",
    valueMode: "literal"
}

const PbiMapperPage: React.FC = () => {
    const params = useParams()
    const collectionId = params.collectionId || ""
    const { jwtToken } = useUser()
    const [pbiAccessToken, setPbiAccessToken] = useState("")
    const [limit, setLimit] = useState(1)
    const [force, setForce] = useState(false)
    const [previewResult, setPreviewResult] = useState<any>(undefined)
    const [syncResult, setSyncResult] = useState<PbiSyncResponse | undefined>(undefined)
    const [errorMessage, setErrorMessage] = useState("")
    const [mapperConfig, setMapperConfig] = useState<PbiMapperConfig>({
        titlePath: "",
        descriptionPath: "",
        staticDescription: "",
        accessMode: "PUBLIC",
        researchAreas: ["Astronomy"],
        annotationMappings: [],
        includeEthnopediaId: true,
        enrichmentMode: "none"
    })

    const { data: preview, isLoading } = useQuery({
        queryKey: ["pbiCollectionPreview", collectionId, jwtToken],
        queryFn: () => getPbiCollectionPreview(collectionId, jwtToken),
        enabled: !!collectionId
    })

    const { data: pbiStatus } = useQuery({
        queryKey: ["pbiStatus", Boolean(pbiAccessToken)],
        queryFn: () => getPbiStatus(jwtToken, pbiAccessToken),
        enabled: true
    })

    const fields = useMemo(() => preview?.fields || [], [preview])

    const updateMapping = (index: number, field: keyof PbiAnnotationMapping, value: string) => {
        setMapperConfig(prev => ({
            ...prev,
            annotationMappings: prev.annotationMappings.map((mapping, mappingIndex) =>
                mappingIndex === index ? { ...mapping, [field]: value } : mapping
            )
        }))
    }

    const dryRunMutation = useMutation(
        () => previewPbiSync(collectionId, mapperConfig, jwtToken, Math.min(limit, 5)),
        {
            onSuccess: data => {
                setPreviewResult(data)
                setErrorMessage("")
            },
            onError: (error: any) => setErrorMessage(error?.response?.data?.error || error.message)
        }
    )

    const syncMutation = useMutation(
        () => startPbiSync(collectionId, mapperConfig, { limit, force }, jwtToken, pbiAccessToken),
        {
            onSuccess: data => {
                setSyncResult(data)
                setErrorMessage("")
            },
            onError: (error: any) => setErrorMessage(error?.response?.data?.error || error.message)
        }
    )

    if (isLoading || !preview) {
        return <LoadingPage />
    }

    return (
        <div className="min-h-screen flex flex-col" data-testid="pbi-mapper-page-container">
            <Navbar />
            <main className="container px-8 mt-6 max-w-5xl mx-auto pb-10">
                <h1 className="text-3xl font-bold mb-2">Mapper PBI</h1>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Kolekcja: <strong>{preview.collection.name}</strong>
                </p>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-600 p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-3">Status połączenia</h2>
                    <div className="text-sm space-y-1">
                        <p>API PBI: <strong>{pbiStatus?.pbiReachable ? "osiągalne" : "niepotwierdzone"}</strong></p>
                        <p>Auth mode: <strong>{pbiStatus?.authMode || "request_token"}</strong></p>
                        <p>Token/API key: <strong>{pbiStatus?.hasAuth ? "dostępny" : "brak"}</strong></p>
                    </div>
                    <label className="block mt-4 text-sm font-medium">PBI access token z Postmana</label>
                    <textarea
                        className="w-full mt-1 p-2 border rounded text-black"
                        rows={3}
                        value={pbiAccessToken}
                        onChange={event => setPbiAccessToken(event.target.value)}
                        placeholder="Token nie jest zapisywany; używany tylko do requestu synchronizacji."
                    />
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-600 p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-3">Mapowanie Research Object</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <label className="flex flex-col text-sm">
                            Pole tytułu
                            <select
                                className="mt-1 p-2 border rounded text-black"
                                value={mapperConfig.titlePath}
                                onChange={event => setMapperConfig(prev => ({ ...prev, titlePath: event.target.value }))}
                            >
                                <option value="">Fallback: Ethnopedia record ID</option>
                                {fields.map((field: string) => <option key={field} value={field}>{field}</option>)}
                            </select>
                        </label>
                        <label className="flex flex-col text-sm">
                            Pole opisu
                            <select
                                className="mt-1 p-2 border rounded text-black"
                                value={mapperConfig.descriptionPath}
                                onChange={event => setMapperConfig(prev => ({ ...prev, descriptionPath: event.target.value }))}
                            >
                                <option value="">Fallback: opis importu</option>
                                {fields.map((field: string) => <option key={field} value={field}>{field}</option>)}
                            </select>
                        </label>
                        <label className="flex flex-col text-sm">
                            Stały opis, opcjonalnie
                            <input
                                className="mt-1 p-2 border rounded text-black"
                                value={mapperConfig.staticDescription || ""}
                                onChange={event => setMapperConfig(prev => ({ ...prev, staticDescription: event.target.value }))}
                            />
                        </label>
                        <label className="flex flex-col text-sm">
                            Tryb dostępu
                            <select
                                className="mt-1 p-2 border rounded text-black"
                                value={mapperConfig.accessMode}
                                onChange={event => setMapperConfig(prev => ({ ...prev, accessMode: event.target.value as any }))}
                            >
                                <option value="PUBLIC">PUBLIC</option>
                                <option value="PRIVATE">PRIVATE</option>
                            </select>
                        </label>
                        <label className="flex flex-col text-sm md:col-span-2">
                            Research areas, rozdzielone przecinkami
                            <input
                                className="mt-1 p-2 border rounded text-black"
                                value={mapperConfig.researchAreas.join(", ")}
                                onChange={event => setMapperConfig(prev => ({
                                    ...prev,
                                    researchAreas: event.target.value.split(",").map(area => area.trim()).filter(Boolean)
                                }))}
                            />
                        </label>
                    </div>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-600 p-6 mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xl font-semibold">Adnotacje PBI</h2>
                        <button
                            type="button"
                            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm"
                            onClick={() => setMapperConfig(prev => ({ ...prev, annotationMappings: [...prev.annotationMappings, emptyMapping] }))}
                        >
                            Dodaj mapowanie
                        </button>
                    </div>
                    <p className="text-sm mb-3">
                        Backend zawsze dokłada <code>artwork._id</code> jako <code>http://purl.org/dc/terms/identifier</code>.
                    </p>
                    {mapperConfig.annotationMappings.map((mapping, index) => (
                        <div key={index} className="grid md:grid-cols-4 gap-2 mb-2">
                            <select
                                className="p-2 border rounded text-black md:col-span-2"
                                value={mapping.sourcePath}
                                onChange={event => updateMapping(index, "sourcePath", event.target.value)}
                            >
                                <option value="">Wybierz pole Ethnopedii</option>
                                {fields.map((field: string) => <option key={field} value={field}>{field}</option>)}
                            </select>
                            <input
                                className="p-2 border rounded text-black"
                                list="pbi-predicate-options"
                                value={mapping.predicate}
                                onChange={event => updateMapping(index, "predicate", event.target.value)}
                            />
                            <select
                                className="p-2 border rounded text-black"
                                value={mapping.valueMode}
                                onChange={event => updateMapping(index, "valueMode", event.target.value)}
                            >
                                <option value="literal">literal</option>
                                <option value="array">array</option>
                                <option value="uri">uri</option>
                            </select>
                        </div>
                    ))}
                    <datalist id="pbi-predicate-options">
                        {defaultPredicateOptions.map(predicate => <option key={predicate} value={predicate} />)}
                    </datalist>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-600 p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-3">Synchronizacja</h2>
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                        <label className="text-sm">
                            Limit
                            <input
                                className="ml-2 p-2 border rounded text-black w-24"
                                type="number"
                                min={1}
                                max={50}
                                value={limit}
                                onChange={event => setLimit(Number(event.target.value))}
                            />
                        </label>
                        <label className="text-sm flex items-center gap-2">
                            <input type="checkbox" checked={force} onChange={() => setForce(prev => !prev)} />
                            Wymuś ponowną synchronizację
                        </label>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            className="px-4 py-2 bg-white border rounded text-black"
                            onClick={() => dryRunMutation.mutate()}
                        >
                            Podgląd payloadów
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded disabled:bg-gray-500"
                            disabled={!jwtToken || !pbiAccessToken}
                            onClick={() => syncMutation.mutate()}
                        >
                            Wyślij do PBI
                        </button>
                    </div>
                    {errorMessage && <p className="mt-3 text-red-500">{errorMessage}</p>}
                </section>

                {previewResult && (
                    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-600 p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-3">Dry-run</h2>
                        <pre className="text-xs overflow-auto bg-gray-100 text-black p-3 rounded">
                            {JSON.stringify(previewResult, null, 2)}
                        </pre>
                    </section>
                )}

                {syncResult && (
                    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-600 p-6">
                        <h2 className="text-xl font-semibold mb-3">Wynik synchronizacji</h2>
                        <p className="mb-3">Synced: {syncResult.synced}, skipped: {syncResult.skipped}, failed: {syncResult.failed}</p>
                        <div className="overflow-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left border-b">
                                        <th className="p-2">Ethnopedia ID</th>
                                        <th className="p-2">PBI RO</th>
                                        <th className="p-2">Status</th>
                                        <th className="p-2">Błąd</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {syncResult.items.map(item => (
                                        <tr key={item.ethnopediaArtworkId} className="border-b">
                                            <td className="p-2">{item.ethnopediaArtworkId}</td>
                                            <td className="p-2">{item.pbiRoIdentifier || "-"}</td>
                                            <td className="p-2">{item.status}</td>
                                            <td className="p-2">{item.error || item.lastError || "-"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </main>
        </div>
    )
}

export default PbiMapperPage
