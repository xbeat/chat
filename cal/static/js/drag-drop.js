/**
 * drag-drop.js - Sistema centralizzato per la gestione del drag and drop nel calendario
 */

// Variabili per tenere traccia dello stato del drag and drop
let draggedEventId = null;
let draggedElement = null;
let dragOffsetY = 0;
let eventOriginalData = null;

/**
 * Inizializza il drag and drop per tutti gli elementi evento nella vista corrente
 * @param {string} viewType - Tipo di vista ('month', 'week', 'day')
 */
function initDragAndDrop(viewType) {
    console.log(`Inizializzazione drag and drop per la vista: ${viewType}`);
    
    // Rimuovi eventuali listener precedenti
    cleanupDragListeners();
    
    // Inizializza gli eventi in base al tipo di vista
    switch (viewType) {
        case 'month':
            initMonthViewDragDrop();
            break;
        case 'week':
            initWeekViewDragDrop();
            break;
        case 'day':
            initDayViewDragDrop();
            break;
        default:
            console.log(`Drag and drop non supportato per la vista: ${viewType}`);
    }
}

/**
 * Rimuove tutti i listener di drag and drop precedenti
 */
function cleanupDragListeners() {
    console.log('Pulizia dei listener di drag and drop precedenti');
    
    // Rimuovi la classe draggable e gli attributi di tutti gli eventi
    document.querySelectorAll('.event, .time-event').forEach(event => {
        event.removeAttribute('draggable');
        event.classList.remove('draggable');
        
        // Rimuovi i data attributes specifici del drag and drop
        event.removeAttribute('data-drag-initialized');
    });
    
    // Rimuovi classi specifiche del drag and drop dalle celle
    document.querySelectorAll('.calendar-day, .time-slot').forEach(cell => {
        cell.classList.remove('drag-over', 'droppable');
    });
}

/**
 * Inizializza il drag and drop per la vista mensile
 */
function initMonthViewDragDrop() {
    console.log('Inizializzazione drag and drop per la vista mensile');
    
    // Seleziona tutti gli eventi nella vista mensile
    const monthEvents = document.querySelectorAll('#monthGrid .event');
    const calendarDays = document.querySelectorAll('#monthGrid .calendar-day');
    
    console.log(`Trovati ${monthEvents.length} eventi e ${calendarDays.length} giorni nel calendario`);
    
    // Rendi gli eventi trascinabili
    monthEvents.forEach(event => {
        // Evita di inizializzare più volte lo stesso elemento
        if (event.getAttribute('data-drag-initialized') === 'true') return;
        
        // Imposta l'attributo draggable
        event.setAttribute('draggable', 'true');
        event.classList.add('draggable');
        event.setAttribute('data-drag-initialized', 'true');
        
        // Gestori eventi per il drag
        event.addEventListener('dragstart', handleEventDragStart);
        event.addEventListener('dragend', handleEventDragEnd);
        
        // Impedisci che il click sull'evento si propaghi alla cella calendario
        event.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
    
    // Configura le celle del calendario come destinazioni di drop
    calendarDays.forEach(day => {
        day.addEventListener('dragover', handleDayDragOver);
        day.addEventListener('dragleave', handleDayDragLeave);
        day.addEventListener('drop', handleMonthViewDrop);
    });
}

/**
 * Inizializza il drag and drop per la vista settimanale
 */
function initWeekViewDragDrop() {
    console.log('Inizializzazione drag and drop per la vista settimanale');
    
    // Seleziona tutti gli eventi nella vista settimanale
    const weekEvents = document.querySelectorAll('#weekGrid .time-event');
    const timeSlots = document.querySelectorAll('#weekGrid .time-slot');
    
    console.log(`Trovati ${weekEvents.length} eventi e ${timeSlots.length} slot temporali nella vista settimanale`);
    
    // Rendi gli eventi trascinabili
    weekEvents.forEach(event => {
        // Evita di inizializzare più volte lo stesso elemento
        if (event.getAttribute('data-drag-initialized') === 'true') return;
        
        // Imposta l'attributo draggable
        event.setAttribute('draggable', 'true');
        event.classList.add('draggable');
        event.setAttribute('data-drag-initialized', 'true');
        
        // Gestori eventi per il drag
        event.addEventListener('dragstart', handleTimeEventDragStart);
        event.addEventListener('dragend', handleEventDragEnd);
        
        // Impedisci che il click sull'evento si propaghi alla cella
        event.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
    
    // Configura gli slot temporali come destinazioni di drop
    timeSlots.forEach(slot => {
        slot.addEventListener('dragover', handleSlotDragOver);
        slot.addEventListener('dragleave', handleSlotDragLeave);
        slot.addEventListener('drop', handleWeekViewDrop);
    });
}

/**
 * Inizializza il drag and drop per la vista giornaliera
 */
function initDayViewDragDrop() {
    console.log('Inizializzazione drag and drop per la vista giornaliera');
    
    // Seleziona tutti gli eventi nella vista giornaliera
    const dayEvents = document.querySelectorAll('#dayGrid .time-event');
    const timeSlots = document.querySelectorAll('#dayGrid .time-slot');
    
    console.log(`Trovati ${dayEvents.length} eventi e ${timeSlots.length} slot temporali nella vista giornaliera`);
    
    // Rendi gli eventi trascinabili
    dayEvents.forEach(event => {
        // Evita di inizializzare più volte lo stesso elemento
        if (event.getAttribute('data-drag-initialized') === 'true') return;
        
        // Imposta l'attributo draggable
        event.setAttribute('draggable', 'true');
        event.classList.add('draggable');
        event.setAttribute('data-drag-initialized', 'true');
        
        // Gestori eventi per il drag
        event.addEventListener('dragstart', handleTimeEventDragStart);
        event.addEventListener('dragend', handleEventDragEnd);
        
        // Impedisci che il click sull'evento si propaghi alla cella
        event.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
    
    // Configura gli slot temporali come destinazioni di drop
    timeSlots.forEach(slot => {
        slot.addEventListener('dragover', handleSlotDragOver);
        slot.addEventListener('dragleave', handleSlotDragLeave);
        slot.addEventListener('drop', handleDayViewDrop);
    });
}

/**
 * Gestore per l'inizio del drag di un evento nella vista mensile
 * @param {DragEvent} e - Evento di drag
 */
function handleEventDragStart(e) {
    console.log('Inizio trascinamento evento');
    
    // Salva l'ID dell'evento trascinato e l'elemento
    draggedEventId = this.getAttribute('data-id');
    draggedElement = this;
    
    // Memorizza i dati originali dell'evento (per eventuale annullamento)
    eventOriginalData = {
        id: draggedEventId,
        element: draggedElement,
        parent: draggedElement.parentNode
    };
    
    // Imposta i dati di trasferimento
    e.dataTransfer.setData('text/plain', draggedEventId);
    e.dataTransfer.effectAllowed = 'move';
    
    // Aggiungi una classe per lo stile durante il trascinamento
    this.classList.add('dragging');
    
    // Evidenzia tutte le celle di destinazione potenziali
    document.querySelectorAll('.calendar-day').forEach(day => {
        day.classList.add('droppable');
    });
}

/**
 * Gestore per l'inizio del drag di un evento nelle viste temporali (giornaliera/settimanale)
 * @param {DragEvent} e - Evento di drag
 */
function handleTimeEventDragStart(e) {
    console.log('Inizio trascinamento evento temporale');
    
    // Salva l'ID dell'evento trascinato e l'elemento
    draggedEventId = this.getAttribute('data-id');
    draggedElement = this;
    
    // Calcola l'offset del mouse all'interno dell'evento (importante per posizionare correttamente)
    const rect = this.getBoundingClientRect();
    dragOffsetY = e.clientY - rect.top;
    
    // Memorizza i dati originali dell'evento
    eventOriginalData = {
        id: draggedEventId,
        element: draggedElement,
        parent: draggedElement.parentNode,
        top: draggedElement.style.top,
        height: draggedElement.style.height
    };
    
    // Imposta i dati di trasferimento
    e.dataTransfer.setData('text/plain', draggedEventId);
    e.dataTransfer.effectAllowed = 'move';
    
    // Salva anche l'offset Y e altri dati utili
    const eventData = {
        id: draggedEventId,
        offsetY: dragOffsetY,
        height: rect.height,
        top: rect.top
    };
    e.dataTransfer.setData('application/json', JSON.stringify(eventData));
    
    // Aggiungi una classe per lo stile durante il trascinamento
    this.classList.add('dragging');
    
    // Evidenzia tutti gli slot temporali di destinazione potenziali
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.add('droppable');
    });
}

/**
 * Gestore per la fine del drag di un evento
 * @param {DragEvent} e - Evento di drag
 */
function handleEventDragEnd(e) {
    console.log('Fine trascinamento evento');
    
    // Rimuovi la classe di trascinamento
    if (draggedElement) {
        draggedElement.classList.remove('dragging');
    }
    
    // Rimuovi le classi dalle potenziali destinazioni
    document.querySelectorAll('.calendar-day, .time-slot').forEach(el => {
        el.classList.remove('drag-over', 'droppable');
    });
    
    // Resetta le variabili di stato
    draggedEventId = null;
    draggedElement = null;
    dragOffsetY = 0;
    eventOriginalData = null;
}

/**
 * Gestore per il dragover su un giorno del calendario (vista mensile)
 * @param {DragEvent} e - Evento di drag
 */
function handleDayDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Imposta l'effetto di drag
    e.dataTransfer.dropEffect = 'move';
    
    // Aggiungi una classe per evidenziare la cella
    this.classList.add('drag-over');
}

/**
 * Gestore per il dragleave su un giorno del calendario
 * @param {DragEvent} e - Evento di drag
 */
function handleDayDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Rimuovi la classe di evidenziazione
    this.classList.remove('drag-over');
}

/**
 * Gestore per il dragover su uno slot temporale (viste giornaliera/settimanale)
 * @param {DragEvent} e - Evento di drag
 */
function handleSlotDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Imposta l'effetto di drag
    e.dataTransfer.dropEffect = 'move';
    
    // Aggiungi una classe per evidenziare lo slot
    this.classList.add('drag-over');
}

/**
 * Gestore per il dragleave su uno slot temporale
 * @param {DragEvent} e - Evento di drag
 */
function handleSlotDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Rimuovi la classe di evidenziazione
    this.classList.remove('drag-over');
}

/**
 * Gestore per il drop in vista mensile
 * @param {DragEvent} e - Evento di drop
 */
function handleMonthViewDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Rimuovi la classe di evidenziazione
    this.classList.remove('drag-over');
    
    // Ottieni l'ID dell'evento trascinato
    const eventId = e.dataTransfer.getData('text/plain');
    if (!eventId) return;
    
    // Ottieni la data di destinazione
    const targetDate = this.getAttribute('data-date');
    if (!targetDate) return;
    
    console.log(`Drop evento ${eventId} sulla data ${targetDate}`);
    
    // Converti la data nel formato corretto
    const [year, month, day] = targetDate.split('-').map(Number);
    const dropDate = new Date(year, month - 1, day);
    
    // Trova l'evento e aggiorna la data
    const evento = eventi.find(ev => ev.id === eventId);
    if (evento) {
        // Calcola la differenza di giorni
        const oldDate = new Date(evento.dataInizio);
        const diffDays = Math.floor((dropDate - oldDate) / (1000 * 60 * 60 * 24));
        
        // Aggiorna le date mantenendo l'ora originale
        const newStartDate = new Date(evento.dataInizio);
        newStartDate.setDate(newStartDate.getDate() + diffDays);
        
        const newEndDate = new Date(evento.dataFine);
        newEndDate.setDate(newEndDate.getDate() + diffDays);
        
        // Aggiorna l'evento
        modificaEvento(eventId, {
            dataInizio: newStartDate,
            dataFine: newEndDate
        });
        
        // Aggiorna la vista
        aggiornaVista();
        
        console.log(`Evento ${evento.titolo} spostato con successo alla data ${targetDate}`);
    }
}

/**
 * Gestore per il drop in vista settimanale
 * @param {DragEvent} e - Evento di drop
 */
function handleWeekViewDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Rimuovi la classe di evidenziazione
    this.classList.remove('drag-over');
    
    // Ottieni l'ID dell'evento trascinato
    const eventId = e.dataTransfer.getData('text/plain');
    if (!eventId) return;
    
    try {
        // Ottieni i dati dell'evento trascinato
        const eventData = JSON.parse(e.dataTransfer.getData('application/json'));
        
        // Ottieni l'ora e il giorno dello slot di destinazione
        const hour = parseInt(this.getAttribute('data-ora') || '0');
        const dayIndex = parseInt(this.getAttribute('data-giorno') || '0');
        
        console.log(`Drop evento ${eventId} su giorno ${dayIndex} ora ${hour}`);
        
        // Calcola la nuova data/ora
        const weekStartDate = getPrimoGiornoSettimana(dataAttuale);
        const targetDate = new Date(weekStartDate);
        targetDate.setDate(targetDate.getDate() + dayIndex);
        targetDate.setHours(hour, 0, 0);
        
        // Trova l'evento e calcola la durata
        const evento = eventi.find(ev => ev.id === eventId);
        if (evento) {
            // Calcola la durata dell'evento in minuti
            const oldStart = new Date(evento.dataInizio);
            const oldEnd = new Date(evento.dataFine);
            const durationMs = oldEnd - oldStart;
            
            // Crea le nuove date
            const newStartDate = new Date(targetDate);
            const newEndDate = new Date(newStartDate.getTime() + durationMs);
            
            // Aggiorna l'evento
            modificaEvento(eventId, {
                dataInizio: newStartDate,
                dataFine: newEndDate
            });
            
            // Aggiorna la vista
            aggiornaVista();
            
            console.log(`Evento ${evento.titolo} spostato con successo a ${newStartDate.toLocaleString()}`);
        }
    } catch (error) {
        console.error('Errore durante il drop in vista settimanale:', error);
    }
}

/**
 * Gestore per il drop in vista giornaliera
 * @param {DragEvent} e - Evento di drop
 */
function handleDayViewDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Rimuovi la classe di evidenziazione
    this.classList.remove('drag-over');
    
    // Ottieni l'ID dell'evento trascinato
    const eventId = e.dataTransfer.getData('text/plain');
    if (!eventId) return;
    
    try {
        // Ottieni i dati dell'evento trascinato
        const eventData = JSON.parse(e.dataTransfer.getData('application/json'));
        
        // Ottieni l'ora dello slot di destinazione
        const hour = parseInt(this.getAttribute('data-ora') || '0');
        
        console.log(`Drop evento ${eventId} su ora ${hour}`);
        
        // Calcola la nuova data/ora
        const targetDate = new Date(dataAttuale);
        targetDate.setHours(hour, 0, 0);
        
        // Trova l'evento e calcola la durata
        const evento = eventi.find(ev => ev.id === eventId);
        if (evento) {
            // Calcola la durata dell'evento in minuti
            const oldStart = new Date(evento.dataInizio);
            const oldEnd = new Date(evento.dataFine);
            const durationMs = oldEnd - oldStart;
            
            // Crea le nuove date
            const newStartDate = new Date(targetDate);
            const newEndDate = new Date(newStartDate.getTime() + durationMs);
            
            // Aggiorna l'evento
            modificaEvento(eventId, {
                dataInizio: newStartDate,
                dataFine: newEndDate
            });
            
            // Aggiorna la vista
            aggiornaVista();
            
            console.log(`Evento ${evento.titolo} spostato con successo a ${newStartDate.toLocaleString()}`);
        }
    } catch (error) {
        console.error('Errore durante il drop in vista giornaliera:', error);
    }
}

// Esporta le funzioni
window.dragDrop = {
    init: initDragAndDrop,
    cleanup: cleanupDragListeners
};