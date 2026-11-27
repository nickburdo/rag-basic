const chat = document.querySelector('#chat');
/** @type {HTMLInputElement} */
const input = document.querySelector('#question');
/** @type {HTMLButtonElement} */
const button = document.querySelector('#send');
const history = [];

function addMessage(text = '') {
  const p = document.createElement('p');
  p.textContent = text;
  return chat.appendChild(p);
}

document.getElementById('form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const question = input.value.trim();
  if (!question) return;
  input.value = '';

  addMessage('You: ' + question);
  const answerEl = addMessage('Думаю...');
  const sourceEl = addMessage();
  let waitingForToken = true;
  let failed = false;
  const showNotAnswer = () => {
    answerEl.textContent = 'Не вдалося отримати відповідь. Спробуйте ще раз.';
    sourceEl.textContent = '';
    failed = true;
  };

  input.disabled = true;
  button.disabled = true;

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, history }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error: ${res.status}`);
    }

    // Events are separated by an empty line; an incomplete event is left in the buffer until the next batch
    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
    let buffer = '';
    for (
      let chunk = await reader.read();
      !chunk.done;
      chunk = await reader.read()
    ) {
      const events = (buffer + chunk.value).split('\n\n');
      buffer = events.pop();
      for (const raw of events) {
        const [, type, data] = raw.match(/^event: (.+)\ndata: (.+)$/);
        const value = JSON.parse(data);
        if (type === 'token') {
          if (waitingForToken) {
            answerEl.textContent = value;
            waitingForToken = false;
          } else {
            answerEl.textContent += value;
          }
        }
        if (type === 'sources') {
          sourceEl.textContent =
            'Джерела: ' + value.map((s) => `[${s.n} ${s.title}]`).join(', ');
        }
        if (type === 'error') {
          showNotAnswer();
        }
      }
    }

    if (waitingForToken && !failed) {
      showNotAnswer();
    }
  } catch (error) {
    console.error(error);
    showNotAnswer();
  } finally {
    input.disabled = false;
    input.focus();
    button.disabled = false;
  }

  if (!failed) {
    history.push(
      { role: 'user', content: question },
      { role: 'assistant', content: answerEl.textContent },
    );
  }
});
