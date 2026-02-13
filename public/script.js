async function loadWorkouts(){
  const res = await fetch('/api/workouts');
  const data = await res.json();
  const tbody = document.querySelector('#workouts-table tbody');
  tbody.innerHTML = '';
  for (const w of data){
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(w.name)}</td>
      <td>${escapeHtml(w.type)}</td>
      <td>${escapeHtml(w.durationMinutes)}</td>
      <td>${escapeHtml(w.caloriesBurned || '')}</td>
      <td>${escapeHtml(w.intensity)}</td>
      <td>${new Date(w.date).toLocaleDateString()}</td>
      <td>${actionsFor(w)}</td>
    `;
    tbody.appendChild(tr);
  }
}

function actionsFor(w){
  if (!CURRENT_USER) return '';
  return `<a href="/edit/${w._id}">Edit</a> <a href="#" data-id="${w._id}" class="del">Delete</a>`;
}

function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

document.addEventListener('click', async (e)=>{
  if (e.target.matches('.del')){
    e.preventDefault();
    if (!confirm('Delete this workout?')) return;
    const id = e.target.dataset.id;
    const res = await fetch('/api/workouts/' + id, { method: 'DELETE' });
    if (res.ok) loadWorkouts(); else alert('Delete failed');
  }
});

loadWorkouts();
