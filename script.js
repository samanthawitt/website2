const start = document.querySelector('.start');
const submit = document.querySelector('.submit');

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -80px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }else{
            entry.target.classList.remove('visible');
        }
    });
}, observerOptions);

const observeCard = card => {
    card.classList.add('animate-on-scroll');
    observer.observe(card);
};

document.querySelectorAll('.flip-card').forEach(observeCard);
const apiKey = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_OPEN_AI_KEY : OPEN_AI_KEY;

start.addEventListener('click', async () => {

    let years = [];
    if (document.querySelector('.sixteenth').checked) years.push("16th century");
    if (document.querySelector('.seventeenth').checked) years.push("17th century");
    if (document.querySelector('.eighteenth').checked) years.push("18th century");
    if (document.querySelector('.nineteenth').checked) years.push("19th century");
    if (document.querySelector('.twentieth').checked) years.push("20th century");

    const yearsText = years.length > 0 
        ? `from the following centuries: ${years.join(", ")}`
        : `from any time period`;

    const selectedCard = document.querySelector('input[name="cards"]:checked');
    const numberofcards = selectedCard ? selectedCard.value : 6;

    let difficulty = '';
    const difficult = document.querySelector('#difficult');
    if (difficult && difficult.checked) {
        difficulty = "Include lesser-known historical events.";
    }

    const prompt = `Generate ${numberofcards} different historical events or inventions ${yearsText}. ${difficulty} Include a title and a date for each event. Number each event (1, 2, etc.). Return ONLY valid JSON in this format:
        [
        {
            "title": "...",
            "date": "...",
            "description": "..."
        }
        ]`;

    async function askAI(prompt) {
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                    },
                body: JSON.stringify({
                    input: prompt
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const data = await response.json();
            return data;

        } catch (error) {
            console.error("Error:", error);
            alert("Unable to reach AI service.");
        }
    }

    const result = await askAI(prompt);
    console.log(result);

    const text = result.output[0].content[0].text;
    const events = JSON.parse(text);

    console.log(events);
    renderCards(shuffle(events));
    
    function renderCards(events) {
        const container = document.getElementById('timeline-container');
        const arrow = document.getElementById('arrow');

        container.innerHTML = '';
        arrow.innerText = '';

        const startCard = document.createElement('li');
        startCard.className = 'startend';
        startCard.innerHTML = '<h3>Start</h3>';
        container.appendChild(startCard);

        events.forEach((event, index) => {
            const card = document.createElement('li');
            card.classList.add('flip-card');
            card.setAttribute('draggable', 'true');
            const cardinner = document.createElement('div');
            cardinner.classList.add('flip-card-inner');
            card.appendChild(cardinner);
            const cardfront = document.createElement('div');
            cardfront.classList.add('flip-card-front');
            cardinner.appendChild(cardfront);
            const cardback = document.createElement('div');
            cardback.classList.add('flip-card-back');
            cardinner.appendChild(cardback);

            cardfront.innerHTML = `
                <h3>${event.title}</h3>
                <p>${event.description}</p>
            `;

            cardback.innerHTML = `
                <h3>${event.title}</h3>
                <p><strong>Date:</strong> ${event.date}</p>
            `;

            container.appendChild(card);
            observeCard(card);
    
        });

            const scroll = document.createElement('p');
            scroll.className = 'scroll';
            scroll.innerHTML = '<h2>&#8595</h2>';
            arrow.appendChild(scroll);

        const endCard = document.createElement('li');
        endCard.className = 'startend';
        endCard.innerHTML = '<h3>End</h3>';
        container.appendChild(endCard);
    }

    function shuffle(array) {
        return array.sort(() => Math.random() - 0.5);
    }


});

document.addEventListener('DOMContentLoaded', () => {
      const list = document.getElementById('timeline-container')
      if (!list) return

      let draggedItem = null

      list.addEventListener('dragstart', (e) => {
        draggedItem = e.target.closest('.flip-card');
        if (draggedItem) {
            draggedItem.classList.add('dragging');
            e.dataTransfer.setDragImage(draggedItem, 0, 0);}
      })

      list.addEventListener('dragend', (e) => {
        if (draggedItem) {
            draggedItem.classList.remove('dragging'); }
        list.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        draggedItem = null;     
      })

      list.addEventListener('dragover', (e) => {
        e.preventDefault()
        const target = e.target.closest('.flip-card')
        if (!target || target === draggedItem) return

        list.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'))
        target.classList.add('drag-over')
      })

      list.addEventListener('drop', (e) => {
        e.preventDefault()
        const target = e.target.closest('.flip-card')
        if (!target || target === draggedItem) return

        target.classList.remove('drag-over')

        const bounding = target.getBoundingClientRect();
        const offset = e.clientY - bounding.top;
        const middle = bounding.height / 2;

        if (offset > middle) {
                list.insertBefore(draggedItem, target.nextSibling);
            } else {
                list.insertBefore(draggedItem, target);
            }

      })

    })

    submit.addEventListener('click', async () => {
        const cardinner = document.querySelectorAll('.flip-card-inner');
        cardinner.forEach(inner => {
            inner.style.transform = 'rotateY(180deg)';
        });
    });
