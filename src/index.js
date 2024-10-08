let processing = false;

/** 
 * uses regex to see if the url is valid.
 * 
 * @param {string} url the url to check.
 * @returns {boolean} whether the url is valid.
 */
const isValidUrl = (url) => (/^https:\/\/medal\.tv\/games\/[^\/]+\/clips\/[^\/]+(\?[^\/]+)?$/).test(url);

/**
 *  extracts the medal 'content id' from its url.
 * 
 *  @param {string} url the url. 
 *  @returns {string} the extracted content id.
 */
const extractContentId = (url) => (/^https:\/\/medal\.tv\/games\/[^\/]+\/clips\/([^\/?]+)/).exec(url)[1];

/**
 *  saves a file, from a url.
 * 
 *  @param {string} url the url.
 *  @param {string} filename the filename to save as. 
 *  @returns {void} N/A
 */
const saveFile = (url, filename) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

/**
 * gets the source.m3u8 file, from the clip url.
 * 
 * @param {string} url the clip url.
 * @returns {string?} the source url.
 */
const getSourceUrl = async (url) => {
    const contentId = extractContentId(url);
    const response = await fetch(`https://medal.tv/api/content/${contentId}`);
    
    if (!response.ok) return null;

    const data = await response.json();
    return data.contentUrl1080p;
}

/**
 * saves an mp4 file.
 * 
 * @param {string} source source file url.
 * @param {string} filename the filename to output.
 * @returns {void} N/A
 */
const save = async (source) => {
    try {
        const response = await fetch(source);
        if (!response.ok) {
            console.error('failed to fetch source: ', response.statusText);
            return
        };

        const videoBlob = await response.blob();
        const url = URL.createObjectURL(videoBlob);

        saveFile(url, "clip");

        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('error during processing:', error);
    }
};

const submitButton = document.querySelectorAll(".url-submit")[0]
console.log(submitButton)

/**
 * starts processing thingy
 * @returns {void}
 */
const startProcessing = () => {
    submitButton.innerHTML = "Processing...";
    submitButton.disabled = true;
    submitButton.classList.add("disabled")
    processing = true;
}

/**
 * ends processing thingy 
 * @returns {void}
 */
const endProcessing = () => {
    submitButton.innerHTML = "Download";
    submitButton.disabled = false;
    submitButton.classList.remove("disabled")
    processing = false;
}

/**
 * handles download requests.
 * @returns {void}
 */
const onSubmit = async () => {
    if (processing) return alert("currently processing a video, please wait.");
    startProcessing();

    /** @type {string} */
    const urlText = document.querySelectorAll(".url-input")[0].value;
    if (!isValidUrl(urlText)) return endProcessing();

    const source = await getSourceUrl(urlText);
    if (!source) return endProcessing();

    await save(source, "clip");

    endProcessing();
}

submitButton.addEventListener('click', onSubmit);