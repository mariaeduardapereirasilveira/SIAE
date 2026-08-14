let faqs= [];
async function  fetchFAQs(){
 const response = await fetch("http://localhost/SIAE/api/faqs/list");
 const result = await response.json();

 console.log(result, result.data);	
 faqs = result.data;

 faqs.forEach(faq => {
   console.log(faq.answer, faq.question);
 });
   renderFAQs();
}
async function  auth(){
 const response = await fetch("http://localhost/SIAE/api/faqs/list");
 const result = await response.json();

 console.log(result, result.data);	
 faqs = result.data;

 faqs.forEach(faq => {
   console.log(faq.answer, faq.question);
 });
   renderFAQs();
}

function renderFAQs() {
    const container = document.querySelector('#faqContainer');
    const actions = (faq) => `
    <div class="faq-actions">
    <button
    class="btn btn-ghost btn-sm"
    onclick="editFAQ(${faq.id})">
    Editar
    </button>
    
    <button
    class="btn btn-ghost btn-sm faq-delete-btn"
    onclick="deleteFAQ(${faq.id})">
    Excluir
    </button>
    </div>
    `;

    container.innerHTML = faqs.map(faq => `
        <div class="accordion-item">
        
        <div
        class="accordion-header"
      onclick="this.parentElement.classList.toggle('active')"
            >
            <span>${faq.question}</span>
            
            <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    >
                    <polyline points="6 9 12 15 18 9"/>
                    </svg>
                    </div>

                    <div class="accordion-content">
                    <p>${faq.answer}</p>
                    
                ${actions(faq)}
            </div>
            
            </div>
            `).join("");
        }
        fetchFAQs();
        
        
        
        
        