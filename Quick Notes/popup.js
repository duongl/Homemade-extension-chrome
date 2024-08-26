document.addEventListener('DOMContentLoaded', function() {
    const saveNoteButton = document.getElementById('saveNote');
    const saveFileButton = document.getElementById('saveFile');
    const toggleNotesButton = document.getElementById('toggleNotes');
    const clearAllNotesButton = document.getElementById('clearAllNotes');
    const noteArea = document.getElementById('note');
    const notesContainer = document.getElementById('notesContainer');
    const searchBox = document.getElementById('searchBox');
    let allNotes = [];
    let showingAllNotes = false; // Track whether all notes are shown

    // Load and display only the most recent 2 or 3 notes, but keep all for searching
    function loadAllNotes() {
        chrome.storage.local.get(null, function(items) {
            allNotes = Object.keys(items).map(key => ({ id: key, content: items[key] }))
                .sort((a, b) => b.id.localeCompare(a.id)); // Sort notes by key assuming keys are timestamps
            if (showingAllNotes) {
                displayNotes(allNotes); // Display all notes if in the "show all" mode
            } else {
                displayNotes(allNotes.slice(0, 3)); // Display only the last 3 notes by default
            }
        });
    }

    // Display notes in the notes container
    function displayNotes(notes) {
        notesContainer.innerHTML = notes.map(note => `
            <div class="note" data-id="${note.id}">
                ${note.content}
            </div>
        `).join('');
    }

    // Populate the text area with the content of the clicked note
    function handleNoteClick(event) {
        const noteElement = event.target;
        if (noteElement.classList.contains('note')) {
            const noteId = noteElement.getAttribute('data-id');
            const noteContent = allNotes.find(note => note.id === noteId).content;
            noteArea.value = noteContent; // Populate the note area with the note content
        }
    }

    // Search through all notes, not just the displayed ones
    function searchNotes() {
        var searchText = searchBox.value.toLowerCase();
        var filteredNotes = allNotes.filter(note => note.content.toLowerCase().includes(searchText));
        displayNotes(filteredNotes);
    }

    // Show all notes
    toggleNotesButton.addEventListener('click', function() {
        showingAllNotes = !showingAllNotes; // Toggle state
        toggleNotesButton.textContent = showingAllNotes ? 'Show Recent Notes' : 'Show All Notes'; // Update button text
        displayNotes(showingAllNotes ? allNotes : allNotes.slice(0, 3)); // Display based on state
    });

    // Clear all notes
    clearAllNotesButton.addEventListener('click', function() {
        chrome.storage.local.clear(function() {
            alert('All notes have been cleared!');
            allNotes = []; // Clear local variable as well
            displayNotes([]); // Clear displayed notes
        });
    });

    loadAllNotes();

    // Event to save a note
    saveNoteButton.addEventListener('click', function() {
        const note = noteArea.value;
        const noteId = `note_${new Date().getTime()}`; // Creating a unique ID for each note
        chrome.storage.local.set({ [noteId]: note }, function() {
            alert('Note saved!');
            loadAllNotes(); // Reload all notes to update the display
        });
    });

    // Event to save a note to a file
    saveFileButton.addEventListener('click', function() {
        const note = noteArea.value;

        if (!note) {
            alert('Please enter some text in the note!');
            return;
        }

        const blob = new Blob([note], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'note.txt';  // Default filename
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
    });

    // Add event listener for clicking on notes
    notesContainer.addEventListener('click', handleNoteClick);

    searchBox.addEventListener('keyup', function() {
        if (searchBox.value.trim().length > 0) {
            searchNotes(); // Perform search when there is input
        } else {
            displayNotes(showingAllNotes ? allNotes : allNotes.slice(0, 3)); // Display based on the current state
        }
    });
});
