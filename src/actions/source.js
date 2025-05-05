"use server"
import { ANIME } from "@consumet/extensions";

const gogo = new ANIME.Gogoanime();

export async function getGogoSources(id) {
    try {
        const data = await gogo.fetchEpisodeSources(id);

        if (!data) return null;

        return data;
    } catch (error) {
        console.log("Error fetching Gogoanime sources:", error);
        return null;
    }
}

export async function getZoroServers(episodeid) {
    try {
        const API = process.env.ZORO_URI;
        let data;

        if (API) {
            const res = await fetch(`${API}/api/v2/hianime/episode/servers?animeEpisodeId=${episodeid}`);
            data = await res.json();
        } else {
            console.log("Fetching Zoro servers from fallback API.");
            const resp = await fetch(`https://anify.eltik.cc/episode/servers?episodeId=${encodeURIComponent(episodeid)}`);
            data = await resp.json();
        }

        if (!data || !data.success || !data.data) {
            console.log("Error fetching Zoro servers:", data);
            return null;
        }

        console.log("Zoro servers fetched successfully:", data);
        return data.data;  // This will return the servers data
    } catch (error) {
        console.log("Error fetching Zoro servers:", error);
        return null;
    }
}

export async function getZoroSources(id, provider, episodeid, epnum, subtype) {
    try {
        const serversData = await getZoroServers(episodeid);
        if (!serversData) return null;

        // Try hd-1 first, then hd-2
        const server = serversData[subtype]?.find(s => s.serverName === "hd-2") || serversData[subtype]?.find(s => s.serverName === "hd-2");
        if (!server) {
            console.log("Server not found for subtype:", subtype);
            return null;
        }

        // Use ZORO_URI for the API endpoint
        const API = process.env.ZORO_URI;
        let data;

        if (API) {
            const res = await fetch(`${API}/api/v2/hianime/episode/sources?animeEpisodeId=${episodeid}&server=${server.serverName}&category=${subtype}`);
            data = await res.json();
        } else {
            console.log(`Fetching sources for server ${server.serverName} and subtype ${subtype}.`);
            const resp = await fetch(`https://anify.eltik.cc/sources?providerId=${provider}&watchId=${encodeURIComponent(episodeid)}&episodeNumber=${epnum}&id=${id}&subType=${subtype}&server=${server.serverName}`);
            data = await resp.json();
        }

        if (!data || !data.success || !data.data) {
            console.log("Error fetching Zoro episode sources:", data);
            return null;
        }

        console.log("Zoro episode sources fetched successfully:", data);
        return data.data;
    } catch (error) {
        console.log("Error fetching Zoro episode sources:", error);
        return null;
    }
}

export async function getAnimeSources(id, provider, epid, epnum, subtype) {
    try {
        if (provider === "gogoanime") {
            const data = await getGogoSources(epid);
            console.log("Gogoanime sources:", data);
            return data;
        }

        if (provider === "zoro") {
            const data = await getZoroSources(id, provider, epid, epnum, subtype);
            console.log("Zoro sources:", data);
            return data;
        }
    } catch (error) {
        console.log("Error fetching anime sources:", error);
        return null;
    }
}
