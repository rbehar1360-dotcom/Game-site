const SUPABASE_URL = "https://phhgxragcckkpvrizjkl.supabase.co";

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoaGd4cmFnY2Nra3B2cml6amtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4MjIwMDUsImV4cCI6MjEwMjM5ODAwNX0.D7WUr9apBM-x3YOYtYO_D_q3kQBPbr0X-xGTCuyT3wA";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

window.supabaseClient = supabaseClient;

const usernameCache = new Map();
const usernameLookupsInFlight = new Map();
let usernameCacheGeneration = 0;
let observedAuthState = false;
let usernameCacheAuthUserId = null;
let cachedAuthUser = null;
let cachedAuthUserResolved = false;
let cachedAuthUserAt = 0;
let authUserRequest = null;
let authUserGeneration = 0;

window.getCurrentAuthUserResponse = function () {
    if (
        cachedAuthUserResolved &&
        Date.now() - cachedAuthUserAt < 30000
    ) {
        return Promise.resolve({
            data: { user: cachedAuthUser },
            error: null
        });
    }

    if (authUserRequest) {
        return authUserRequest;
    }

    const generation = authUserGeneration;
    const request = supabaseClient.auth.getUser().then(({ data, error }) => {
        if (error) {
            return { data: { user: null }, error };
        }

        if (generation !== authUserGeneration) {
            return window.getCurrentAuthUserResponse();
        }

        cachedAuthUser = data?.user || null;
        cachedAuthUserResolved = true;
        cachedAuthUserAt = Date.now();
        return {
            data: { user: cachedAuthUser },
            error: null
        };
    });

    let trackedRequest;
    trackedRequest = request.finally(() => {
        if (authUserRequest === trackedRequest) {
            authUserRequest = null;
        }
    });
    authUserRequest = trackedRequest;
    return trackedRequest;
};

function clearUsernameCache() {
    usernameCacheGeneration++;
    usernameCache.clear();
    usernameLookupsInFlight.clear();
}

function getUsableUsername(username) {
    if (typeof username !== "string") return null;

    const trimmed = username.trim();
    if (!trimmed || trimmed.toLowerCase() === "unknown user") {
        return null;
    }

    return trimmed;
}

window.getUsernameById = async function (userId, knownUsername) {
    if (userId === null || userId === undefined || userId === "") {
        return null;
    }

    const key = String(userId);
    const cachedUsername = usernameCache.get(key);
    if (cachedUsername) return cachedUsername;

    const localUsername = getUsableUsername(knownUsername);
    if (localUsername) {
        usernameCache.set(key, localUsername);
        return localUsername;
    }

    if (usernameCache.has(key)) return null;

    const pendingLookup = usernameLookupsInFlight.get(key);
    if (pendingLookup) return pendingLookup;

    const generation = usernameCacheGeneration;
    const lookup = (async () => {
        const { data, error } = await supabaseClient.rpc(
            "find_username_by_id",
            { search_user_id: userId }
        );

        if (error) throw error;

        const record = Array.isArray(data) ? data[0] : data;
        const username = getUsableUsername(record?.username);
        if (generation === usernameCacheGeneration) {
            usernameCache.set(key, username);
        }

        return username;
    })();

    usernameLookupsInFlight.set(key, lookup);

    try {
        return await lookup;
    } finally {
        if (usernameLookupsInFlight.get(key) === lookup) {
            usernameLookupsInFlight.delete(key);
        }
    }
};

supabaseClient.auth.onAuthStateChange((event, session) => {
    const userId = session?.user?.id || null;

    authUserGeneration++;
    cachedAuthUser = null;
    cachedAuthUserResolved = false;
    cachedAuthUserAt = 0;
    authUserRequest = null;

    if (
        (observedAuthState && userId !== usernameCacheAuthUserId) ||
        (!observedAuthState && event !== "INITIAL_SESSION")
    ) {
        clearUsernameCache();
    }

    usernameCacheAuthUserId = userId;
    observedAuthState = true;
});

console.log("Supabase connected:", supabaseClient);