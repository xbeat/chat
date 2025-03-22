import { formatDate, formatTime, linkifyText }  from './utils.js';

/**
 * messageRenderer.js - Functions for rendering messages
 */

// Aggiorna la funzione createMessageElement per gestire correttamente allegati ed edited
function createMessageElement(message) {
    // Crea prima la riga che conterrà il messaggio e il timestamp
    const messageRow = document.createElement('div');
    messageRow.className = 'message-row';

    // Crea il contenitore del messaggio
    const messageEl = document.createElement('div');
    messageEl.className = 'message-container';
    messageEl.dataset.messageId = message.id;

    if (message.isOwn) {
        messageEl.classList.add('own-message');
    }

    // Assicura che il timestamp sia un oggetto Date
    if (typeof message.timestamp === 'string') {
        message.timestamp = new Date(message.timestamp);
    }

    // Gestisce citazione/risposta
    let quotedHtml = '';
    if (message.replyTo) {
        // Different quoted display based on message type
        let quoteIcon = '';
        const replyToMessage = message.replyTo;

        // Processa il testo del messaggio citato con linkify per mantenere i link
        const processedReplyText = typeof linkifyText === 'function' ?
            linkifyText(replyToMessage.text || '') :
            (replyToMessage.text || '');

        if (replyToMessage && replyToMessage.type === 'file') {
            quoteIcon = `<i class="fas fa-file"></i>`;
        } else if (replyToMessage && replyToMessage.type === 'forwarded') {
            quoteIcon = `<i class="fas fa-share"></i>`;
        }

        // Gestisci visualizzazione allegato nel messaggio citato
        let replyFileHtml = '';
        if (replyToMessage && replyToMessage.fileData) {
            const file = replyToMessage.fileData;
            
            // Verifica che tutte le proprietà necessarie esistano
            if (file && file.icon && file.name && file.ext && file.size) {
                replyFileHtml = `
                <div class="file-attachment quoted-file">
                  <div class="file-icon">
                    <i class="fas ${file.icon}"></i>
                  </div>
                  <div class="file-info">
                    <div class="file-name">${file.name}.${file.ext}</div>
                    <div class="file-size">${file.size}</div>
                  </div>
                </div>
              `;
            } else {
                // Fallback semplice se mancano proprietà
                replyFileHtml = `
                <div class="file-attachment quoted-file">
                  <div class="file-icon">
                    <i class="fas fa-file"></i>
                  </div>
                  <div class="file-info">
                    <div class="file-name">File allegato</div>
                  </div>
                </div>
              `;
            }
        }

        // Controlla che replyToMessage e user siano definiti
        if (replyToMessage && replyToMessage.user) {
            quotedHtml = `
          <div class="quoted-message">
            <div class="quoted-user">${quoteIcon} ${replyToMessage.user.displayName}</div>
            <div class="quoted-text">${processedReplyText}</div>
            ${replyFileHtml}
          </div>
        `;
        }
    }

    // Gestisce visualizzazione messaggio inoltrato
    let forwardedHtml = '';
    if (message.type === 'forwarded' && message.forwardedFrom) {
        const displayName = message.forwardedFrom.displayName;
        forwardedHtml = `
        <div class="forwarded-header">
          <i class="fas fa-share"></i> Forwarded from ${displayName}
        </div>
      `;
    }

    // Gestisce visualizzazione allegato file
    let fileHtml = '';
    if (message.fileData) {
        const file = message.fileData;
        fileHtml = `
        <div class="file-attachment">
          <div class="file-icon">
            <i class="fas ${file.icon}"></i>
          </div>
          <div class="file-info">
            <div class="file-name">${file.name}.${file.ext}</div>
            <div class="file-size">${file.size}</div>
          </div>
          <div class="file-download">
            <i class="fas fa-download"></i>
          </div>
        </div>
      `;
    }

    // Aggiungi spunte per messaggi propri con stato
    let statusIndicator = '';
    if (message.isOwn) {
        if (message.status === 'sending') {
            statusIndicator = '<i class="fas fa-clock" style="opacity: 0.5;"></i>';
        } else {
            statusIndicator = '<i class="fas fa-check"></i>';
        }
    }

    // Process text to convert URLs to links
    const processedText = typeof linkifyText === 'function' ?
        linkifyText(message.text || '') :
        (message.text || '');

    // Get user display name
    const displayName = message.user.displayName;
    const avatarUrl = message.user.avatarUrl;

    // Costruisci l'HTML del messaggio
    messageEl.innerHTML = `
      <div class="avatar">
        <img src="${avatarUrl}" alt="${displayName}">
      </div>
      <div class="message-content">
        <div class="message-header">
          <div class="user-name">${displayName}</div>
        </div>
        <div class="message-bubble ${message.type === 'forwarded' ? 'forwarded-message' : ''}">
          ${forwardedHtml}
          ${quotedHtml}
          <div class="message-text">${processedText}</div>
          ${fileHtml}
         </div>
        <div class="message-actions">
          <button class="reply-button" data-message-id="${message.id}">↩️ Reply</button>
          <button class="menu-button" data-message-id="${message.id}">⋮</button>
        </div>
      </div>
    `;

    // Crea il timestamp separato
    const timestamp = document.createElement('div');
    timestamp.className = 'timestamp';

    // Include '(edited)' nel timestamp se il messaggio è stato modificato
    let timestampText = typeof formatTime === 'function' ?
        formatTime(message.timestamp) :
        message.timestamp.toLocaleTimeString();
    
    if (message.edited) {
        timestampText += ' (edited)';
    }

    timestamp.innerHTML = `${timestampText} ${statusIndicator}`;

    // Assembla la riga completa
    messageRow.appendChild(messageEl);
    messageRow.appendChild(timestamp);

    return messageRow;
}

function renderMessages(messages) {
    if (!messages || messages.length === 0) return;

    console.log("Rendering messages:", messages.length);

    // Ordina cronologicamente (dal più vecchio al più nuovo)
    messages.sort((a, b) => new Date(a.timestamp || a.created_at) - new Date(b.timestamp || b.created_at));

    const chatMessages = document.querySelector('.chat-messages');
    let lastDate = null;
    const fragment = document.createDocumentFragment();

    // Per tenere traccia dei messaggi visualizzati se esiste la variabile globale
    if (typeof displayedMessages !== 'undefined' && !Array.isArray(displayedMessages)) {
        displayedMessages = [];
    }

    // Crea un set di ID di messaggi già visualizzati per un controllo rapido
    const displayedMessageIds = new Set();
    if (Array.isArray(displayedMessages)) {
        displayedMessages.forEach(msg => {
            if (msg && msg.id) {
                displayedMessageIds.add(msg.id);
            }
        });
    }

    messages.forEach(message => {
        // Normalizza il timestamp
        message.timestamp = message.timestamp || message.created_at || new Date();

        // Salta i messaggi duplicati
        if (message.id && displayedMessageIds.has(message.id)) {
            console.log('Skipping duplicate message in renderMessages:', message.id);
            return;
        }

        // Converti timestamp se necessario
        if (typeof message.timestamp === 'string') {
            message.timestamp = new Date(message.timestamp);
        }

        // Aggiungi separatore data se necessario
        const messageDate = message.timestamp.toDateString();
        if (messageDate !== lastDate) {
            const divider = document.createElement('div');
            divider.className = 'date-divider';
            divider.innerHTML = `<span>${formatDate(message.timestamp)}</span>`;
            fragment.appendChild(divider);
            lastDate = messageDate;
        }

        // Crea elemento messaggio
        const messageEl = createMessageElement(message);
        fragment.appendChild(messageEl);

        // Aggiungi alla lista dei messaggi visualizzati
        if (Array.isArray(displayedMessages)) {
            displayedMessages.push(message);
            displayedMessageIds.add(message.id);
        }
    });

    // Aggiungi tutti i messaggi al container
    chatMessages.appendChild(fragment);
}

// Export functions
export {
    createMessageElement
};