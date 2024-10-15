let quotes = [
    { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", category: "Inspiration" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Do not go where the path may lead, go instead where there is no path and leave a trail.", category: "Motivation" }
  ];
  
  function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
  }
  
  function loadQuotes() {
    const savedQuotes = localStorage.getItem('quotes');
    if (savedQuotes) {
      quotes = JSON.parse(savedQuotes);
    }
  }
  
  function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = `<p>${quote.text}</p><p><em>- ${quote.category}</em></p>`;
  }
  
  function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value;
    const newQuoteCategory = document.getElementById('newQuoteCategory').value;
  
    if (newQuoteText && newQuoteCategory) {
      quotes.push({ text: newQuoteText, category: newQuoteCategory });
      saveQuotes();
  
      document.getElementById('newQuoteText').value = '';
      document.getElementById('newQuoteCategory').value = '';
  
      alert('Quote added successfully!');
    } else {
      alert('Please enter both a quote and a category.');
    }
  }
  
  function exportQuotes() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
  
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  function importFromJsonFile(event) {
    const fileReader = new FileReader();
    
    fileReader.onload = function(event) {
      try {
        const importedQuotes = JSON.parse(event.target.result);
        if (Array.isArray(importedQuotes)) {
          quotes.push(...importedQuotes);
          saveQuotes();
          alert('Quotes imported successfully!');
        } else {
          alert('Invalid JSON format.');
        }
      } catch (e) {
        alert('Error reading file.');
      }
    };
    
    fileReader.readAsText(event.target.files[0]);
  }
  
  document.getElementById('newQuote').addEventListener('click', showRandomQuote);
  document.getElementById('exportQuotes').addEventListener('click', exportQuotes);
  
  window.onload = function() {
    loadQuotes();
    showRandomQuote();
  };

  function populateCategories() {
    const categories = [...new Set(quotes.map(quote => quote.category))];
    const categoryFilter = document.getElementById('categoryFilter');
    
    // Clear existing options
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    // Add categories to the dropdown
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });
  }

  function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    const filteredQuotes = selectedCategory === 'all'
      ? quotes
      : quotes.filter(quote => quote.category === selectedCategory);
  
    displayQuotes(filteredQuotes);
    // Save the last selected category to localStorage
    localStorage.setItem('selectedCategory', selectedCategory);
  }
  
  // Function to display quotes
  function displayQuotes(quotesToDisplay) {
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = ''; // Clear existing quotes
    quotesToDisplay.forEach(quote => {
      const quoteElement = document.createElement('p');
      quoteElement.textContent = `${quote.text} - ${quote.category}`;
      quoteDisplay.appendChild(quoteElement);
    });
  }

  
  function loadLastSelectedFilter() {
    const selectedCategory = localStorage.getItem('selectedCategory') || 'all';
    document.getElementById('categoryFilter').value = selectedCategory;
    filterQuotes(); // Apply the filter on page load
  }

  function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value;
    const newQuoteCategory = document.getElementById('newQuoteCategory').value;
  
    if (newQuoteText && newQuoteCategory) {
      const newQuote = { text: newQuoteText, category: newQuoteCategory };
      quotes.push(newQuote);
      saveQuotes(); // Save quotes to localStorage
  
      // Update categories dynamically
      populateCategories();
      filterQuotes(); // Refresh the displayed quotes
    }
  }


  async function fetchQuotesFromServer() {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts');
      const serverQuotes = await response.json();
  
      const formattedQuotes = serverQuotes.map(quote => ({
        text: quote.title,
        category: "General"
      }));
  
      syncQuotesWithLocalData(formattedQuotes);
    } catch (error) {
      console.error('Error fetching quotes from server:', error);
    }
  }
  
  function syncQuotesWithLocalData(serverQuotes) {
    const localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];
  
    const newQuotes = serverQuotes.filter(serverQuote =>
      !localQuotes.some(localQuote => localQuote.text === serverQuote.text)
    );
  
    if (newQuotes.length > 0) {
      const updatedQuotes = [...localQuotes, ...newQuotes];
      localStorage.setItem('quotes', JSON.stringify(updatedQuotes));
      displayQuotes(updatedQuotes);
      notifyUser('New quotes were added from the server.');
    }
  }
  
  function notifyUser(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
  
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
  
  function startPeriodicSync() {
    setInterval(fetchQuotesFromServer, 60000); // Fetch every 60 seconds
  }
  
  window.onload = function() {
    init(); // Initialize the app (load local data, populate categories, etc.)
    startPeriodicSync(); // Start syncing with server
  };
  