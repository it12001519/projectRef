import 'whatwg-fetch';
import 'ti-fetch';
import FetchUtilities from 'js/universal/FetchUtilities';

// Mock data
const base_url = "/";  

// API data
// const base_url = "/api/lots/";

// Boomi data
// const base_url = "http://sctmg-boomi-dev.itg.ti.com:9090/ws/rest/springboot_archetype/lots/";

/**
 * Singleton that handles data interactions.
 * Will help abstract and manage interaction with back-end.
 */
class DataSource {
    
    /**
     * Get lot list
     * @param {*} p 
     */
    static getLotList(p) {
    // Set url 
    let url = base_url 
    if(url === "/") {
        // Mock data
        url += "json/DP1DM5.json";
    } else {
        // API data
        url += p.facility 
        + "?"
        + (p.page === undefined ? "" : "&page=" + p.page) // If page param exists, add it
        + (p.size === undefined ? "" : "&size=" + p.size) // If size param exists, add it
        + (p.sort === undefined ? "" : "&sort=" + p.sort) // If sort param exists, add it
    }
 
    // Fetch data
    return fetch(url, { 
        credentials: 'include',
        headers: new Headers({
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            })
        })
        .then(res => res.json())
        .catch(function(error) {
            FetchUtilities.handleError(error);
        });
    }
    
    /**
     * Get lot detail
     * @param {*} p 
     */
    static getLot(p) {
    // Set url 
    let url = base_url 
    if(url === "/") {
        // Mock data
        url += "json/8446529.json";
    } else {
        // API data
        url += p.facility 
        + (p.lot === undefined ? "" : "/" + p.lot) // If lot param exists, add it
    }
    
    // Fetch data
    return fetch(url, { 
        credentials: 'include',
        headers: new Headers({
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            })
        })
        .then(res => res.json())
        .catch(function(error) {
            FetchUtilities.handleError(error);
        });
    }
}
    
export default DataSource;