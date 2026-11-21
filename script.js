const form = document.getElementById('studentForm');
const fields = ['fullName','matricNo','email','department','level','phone'];
const table = document.getElementById('studentTable');
let students = JSON.parse(localStorage.getItem('studentHubRecords') || '[]');

document.getElementById('todayDate').textContent = new Date().toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short',year:'numeric'});
function saveRecords(){ localStorage.setItem('studentHubRecords',JSON.stringify(students)); }
function escapeHTML(value=''){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function render(){
  const query=document.getElementById('searchInput').value.trim().toLowerCase();
  const filtered=students.filter(s=>[s.fullName,s.matricNo,s.email,s.department,s.level].join(' ').toLowerCase().includes(query));
  document.getElementById('totalCount').textContent=students.length;
  document.getElementById('registeredCount').textContent=students.length;
  document.getElementById('searchStatus').textContent=query?'Filtering':'Ready';
  document.getElementById('showingText').textContent=`Showing ${filtered.length} of ${students.length} student${students.length===1?'':'s'}`;
  if(!filtered.length){
    table.innerHTML=`<tr class="empty-row"><td colspan="5"><div class="empty-icon">▤</div><strong>${query?'No matching students':'No students yet'}</strong><p>${query?'Try another name or matric number.':'Add your first student using the form above.'}</p></td></tr>`;
    return;
  }
  table.innerHTML=filtered.map(s=>`<tr>
    <td><div class="student-name">${escapeHTML(s.fullName)}</div><div class="student-email">${escapeHTML(s.email)}</div></td>
    <td>${escapeHTML(s.matricNo)}</td><td>${escapeHTML(s.department)}</td>
    <td><span class="level-tag">${escapeHTML(s.level)} Level</span></td>
    <td><button class="action-btn" data-edit="${s.id}">Edit</button><button class="action-btn delete-btn" data-delete="${s.id}">Delete</button></td>
  </tr>`).join('');
}
form.addEventListener('submit',e=>{
  e.preventDefault();
  const record={}; fields.forEach(id=>record[id]=document.getElementById(id).value.trim());
  const editingId=document.getElementById('studentId').value;
  if(editingId){students=students.map(s=>s.id===editingId?{...s,...record}:s);}
  else{
    if(students.some(s=>s.matricNo.toLowerCase()===record.matricNo.toLowerCase())){alert('A student with this matric number already exists.');return;}
    students.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),...record});
  }
  saveRecords();form.reset();document.getElementById('studentId').value='';
  document.getElementById('formTitle').textContent='Register a student';
  document.getElementById('saveButton').textContent='＋ Add student';
  document.getElementById('cancelEdit').hidden=true;render();
});
table.addEventListener('click',e=>{
  const editId=e.target.dataset.edit,deleteId=e.target.dataset.delete;
  if(editId){
    const s=students.find(x=>x.id===editId);if(!s)return;
    fields.forEach(id=>document.getElementById(id).value=s[id]||'');
    document.getElementById('studentId').value=s.id;
    document.getElementById('formTitle').textContent='Update student details';
    document.getElementById('saveButton').textContent='Save changes';
    document.getElementById('cancelEdit').hidden=false;
    window.scrollTo({top:0,behavior:'smooth'});
  }
  if(deleteId && confirm('Are you sure you want to delete this student?')){
    students=students.filter(s=>s.id!==deleteId);saveRecords();render();
  }
});
document.getElementById('cancelEdit').addEventListener('click',()=>{
  form.reset();document.getElementById('studentId').value='';
  document.getElementById('formTitle').textContent='Register a student';
  document.getElementById('saveButton').textContent='＋ Add student';
  document.getElementById('cancelEdit').hidden=true;
});
document.getElementById('searchInput').addEventListener('input',render);
render();
