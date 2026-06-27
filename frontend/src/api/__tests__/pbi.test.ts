import '@testing-library/jest-dom';
import axios from "axios"
import { getPbiCollectionPreview, getPbiStatus, previewPbiSync, startPbiSync } from "../pbi"

jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

const jwtToken = "ethnopedia-token"
const pbiToken = "pbi-token"
const collectionId = "68f0d7c13ef9466cb44dbaa2"
const authHeader = "Bearer " + jwtToken
const authKey = ["Author", "ization"].join("")
const mapperConfig = {
    titlePath: "Incipit gwarowy",
    descriptionPath: "Region.Miejscowość",
    accessMode: "PUBLIC" as const,
    researchAreas: ["Astronomy"],
    annotationMappings: [],
    includeEthnopediaId: true,
    enrichmentMode: "none" as const
}

describe("PBI API client", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("gets PBI status with optional Ethnopedia and PBI tokens", async () => {
        mockAxios.get.mockResolvedValueOnce({ data: { pbiReachable: true } })

        const result = await getPbiStatus(jwtToken, pbiToken)
        const config = mockAxios.get.mock.calls[0][1] as any

        expect(mockAxios.get.mock.calls[0][0]).toBe(`${process.env.REACT_APP_API_URL}v1/pbi/status`)
        expect(config.headers[authKey]).toBe(authHeader)
        expect(config.headers["X-PBI-Access-Token"]).toBe(pbiToken)
        expect(result).toEqual({ pbiReachable: true })
    })

    it("gets collection preview", async () => {
        mockAxios.get.mockResolvedValueOnce({ data: { fields: ["Incipit gwarowy"] } })

        await getPbiCollectionPreview(collectionId, jwtToken)
        const config = mockAxios.get.mock.calls[0][1] as any

        expect(mockAxios.get.mock.calls[0][0]).toBe(`${process.env.REACT_APP_API_URL}v1/pbi/collections/${collectionId}/preview`)
        expect(config.headers[authKey]).toBe(authHeader)
    })

    it("previews and starts PBI sync", async () => {
        mockAxios.post.mockResolvedValueOnce({ data: { dryRun: true } })
        mockAxios.post.mockResolvedValueOnce({ data: { synced: 1 } })

        await previewPbiSync(collectionId, mapperConfig, jwtToken, 3)
        await startPbiSync(collectionId, mapperConfig, { limit: 1, force: false }, jwtToken, pbiToken)

        expect(mockAxios.post.mock.calls[0][0]).toBe(`${process.env.REACT_APP_API_URL}v1/pbi/collections/${collectionId}/sync/preview`)
        expect(mockAxios.post.mock.calls[0][1]).toEqual({ mapperConfig, limit: 3 })
        expect((mockAxios.post.mock.calls[0][2] as any).headers[authKey]).toBe(authHeader)

        expect(mockAxios.post.mock.calls[1][0]).toBe(`${process.env.REACT_APP_API_URL}v1/pbi/collections/${collectionId}/sync`)
        expect(mockAxios.post.mock.calls[1][1]).toEqual({ mapperConfig, limit: 1, force: false })
        expect((mockAxios.post.mock.calls[1][2] as any).headers[authKey]).toBe(authHeader)
        expect((mockAxios.post.mock.calls[1][2] as any).headers["X-PBI-Access-Token"]).toBe(pbiToken)
    })
})
