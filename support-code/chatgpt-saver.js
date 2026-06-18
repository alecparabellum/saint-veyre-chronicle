// ==UserScript==
// @name         ChatGPT Advanced Document Saver
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Save <document> blocks to localhost API
// @match        https://chatgpt.com/*
// @grant        GM_xmlhttpRequest
// @connect      localhost
// ==/UserScript==

(function () {
    'use strict';

    const TAG_NAME = 'document';
    const BUTTON_CLASS = 'tm-document-save-button';

    const API_URL = 'http://localhost:8080/deploy';

    // Prevent duplicate autosaves caused by MutationObserver
    const processedPayloads = new Set();

    function getDocumentRegex() {
        return new RegExp(
            `<${TAG_NAME}\\s+([^>]*)>([\\s\\S]*?)<\\/${TAG_NAME}>`,
            'i'
        );
    }

    function parseAttributes(attributeString) {

        const attributes = {};

        const attrRegex = /(\w+)="([^"]*)"/g;

        let match;

        while ((match = attrRegex.exec(attributeString)) !== null) {
            attributes[match[1]] = match[2];
        }

        return attributes;
    }

    function buildPayload(match) {

        const attributes = parseAttributes(match[1]);

       console.log("ORIGINAL 'TEXT': ######################");
       console.log(match[2]);
       console.log(typeof match[2]);
       console.log("\n\n\n\n");

        return {
            path: attributes.path || '',
            filename: attributes.filename || '',
            action: attributes.action || '',
            autosave: attributes.autosave === 'true',
            content: match[2].trim()
        };
    }

    function getPayloadKey(payload) {

       console.log("CONTENT STRINGIFIED: ######################");
       console.log(JSON.stringify(payload.content));
       console.log("\n\n\n\n");

        return JSON.stringify({
            path: payload.path,
            filename: payload.filename,
            action: payload.action,
            content: payload.content
        });
    }

    function saveDocument(payload, button) {

        button.textContent = 'Saving...';
        button.disabled = true;

        GM_xmlhttpRequest({

            method: 'POST',
            url: API_URL,

            headers: {
                'Content-Type': 'application/json'
            },

            data: JSON.stringify({
                path: payload.path,
                filename: payload.filename,
                action: payload.action,
                content: payload.content
            }),

            onload: function (response) {

                if (
                    response.status >= 200 &&
                    response.status < 300
                ) {

                    button.textContent = 'Success';

                } else {

                    button.textContent = 'Retry';
                    button.disabled = false;
                }
            },

            onerror: function () {

                button.textContent = 'Retry';
                button.disabled = false;
            }
        });
    }

    function createUI(targetElement, payload) {

        if (
            targetElement.parentElement?.querySelector(
                `.${BUTTON_CLASS}`
            )
        ) {
            return;
        }

        const wrapper = document.createElement('div');
        wrapper.style.marginBottom = '6px';

        const metadata = document.createElement('div');

        metadata.textContent =
            `📄 ${payload.path}`;

        metadata.style.fontSize = '12px';
        metadata.style.opacity = '0.8';
        metadata.style.marginBottom = '4px';

        const button = document.createElement('button');

        button.className = BUTTON_CLASS;
        button.textContent = 'Save';

        button.style.background = '#16a34a';
        button.style.color = '#fff';
        button.style.border = 'none';
        button.style.padding = '4px 10px';
        button.style.borderRadius = '6px';
        button.style.cursor = 'pointer';

        button.addEventListener('click', () => {
            saveDocument(payload, button);
        });

        wrapper.appendChild(metadata);
        wrapper.appendChild(button);

        targetElement.parentNode.insertBefore(
            wrapper,
            targetElement
        );

        return button;
    }

    function processDocumentBlock(element) {

        if (
            element.dataset.documentProcessed === 'true'
        ) {
            return;
        }

        const text =
            element.innerText ||
            element.textContent ||
            '';

        const match = text.match(
            getDocumentRegex()
        );

        if (!match) {
            return;
        }

        element.dataset.documentProcessed = 'true';

        const payload = buildPayload(match);

        const button =
            createUI(element, payload);

        if (!button) {
            return;
        }

        // Autosave logic
        if (payload.autosave) {

            const key =
                getPayloadKey(payload);

            if (
                processedPayloads.has(key)
            ) {
                button.textContent =
                    'Already Saved';

                button.disabled = true;

                return;
            }

            processedPayloads.add(key);

            saveDocument(payload, button);
        }
    }

    function scan() {

        document
            .querySelectorAll('pre')
            .forEach(processDocumentBlock);
    }

    const observer =
        new MutationObserver(scan);

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    scan();

})();
