// Declare all the global variables here
const searchForm = document.getElementById('search-form');
const cookieModal = document.getElementById('cookie-modal');
const cookieBtn = document.getElementById('cookie-accept');
const loader = document.getElementById("loader");
const formPreference = 'internships';
const listings = document.getElementById("listings");
const listingHeading = document.getElementById("listing-heading");
const backToTopBtn = document.getElementById("btn-back-to-top");

const listingsPerPage = 10; // Number of job listings to display per page
let currentPage = 1; // Current page number

window.onload = async () => {
    let contentType = getItemFromLocalStorage('content'); // Get content type from local storage

    // If url contains id of a job or internship, then change content type accordingly
    if (location.hash !== '') {
        if (!location.hash.includes('#listings')) contentType = location.hash.includes('#internship') ? 'internships' : 'jobs';
    }

    await changeContent(contentType); // Change content type

    let cookieConsent = getItemFromLocalStorage('cookie-accept'); // Get cookie consent from local storage
    if (JSON.parse(cookieConsent)) {
        cookieModal.classList.add('hidden');
    }

    // if url contains id of a job or internship, then scroll to that job or internship
    if (location.hash !== '') {
        document.getElementById(location.hash.replace('#', '')).scrollIntoView();
    }
}

// When the user scrolls down 20px from the top of the document, show the bottom to top button
window.onscroll = function () {
    scrollFunction();
};

// Job card html content generator
const jobsContentHtml = (job, id) => {
    let contentType = getItemFromLocalStorage('content');

    contentType = contentType === 'internships' ? 'internship' : 'job';

    let tags = '';

    job.tags.forEach(tag => {
        let tagBtn = `<button
        class="bg-transparent mb-2 mr-1 hover:bg-black text-xs text-black font-semibold hover:text-white py-2 px-4 border border-black hover:border-transparent rounded-full">
        ${tag}
        </button>`;

        tags += tagBtn;
    })

    let content = `<div class="main-card shadow border border-gray-900 my-5 rounded-lg" id=${contentType}-${id}>
    <div class="card shadow py-5 rounded-t-lg rounded-l-none  border-b-0" style='background:#${randColor()}'>
    <div class="row">
        <div class="column pl-9">
            <h2 class="text-xl font-semibold">${job.role}</h2>
            <p class="text-lg">${job.company}</p>
        </div>
        <div class="column pl-9 lg:pl-0">
            ${tags}
        </div>
        <div class="column column-first flex flex-col items-center justify-center">
            <a href=${job.apply_link}
                target="_blank"
                class="bg-red-400 hover:bg-red-500 shadow text-white font-bold py-2 px-8 rounded cursor-pointer">
                Apply
            </a>
            <p class="text-base mt-2">${job.posted_date}</p>
        </div>
    </div>
    </div>
    
    </div>`;

    return content;
}

// Change content based on job type (jobs/internships), 
// if skill is provided then filter based on that skill on selected job type (jobs/internships)
async function changeContent(type = 'jobs', skill = null) {
    let str = '';
    let headingText = '';
    let jobs = [];
    let id;

    // Reset currentPage to 1 when switching content types
    if (getItemFromLocalStorage('content') !== type) {
        currentPage = 1;
    }

    setItemToLocalStorage('content', type); // set content type to local storage

    // Set the job preference for subscribe form
    formPreference.value = type === 'internships' ? '2' : '1';

    loader.classList.toggle('hidden'); // loading starts

    // Remove all other listings before changing content 
    let cards = document.querySelectorAll(".main-card"); // existing cards
    for (let i = 0; i < cards.length; i++) {
        cards[i].remove();
    }

    if (type === 'internships') {
        id = internshipsData.length;
        jobs = internshipsData;
        headingText = 'Latest Internships';

        if(skill) {
            let filterInternships = internshipsData.filter((job) => {
                if (skill) {
                    return job.tags.find((tag) => tag.toLocaleLowerCase() === skill.toLocaleLowerCase());
                }
            })

            if(filterInternships.length > 0) {
                headingText = `Latest Internships with #${skill} skill`;
                jobs = filterInternships;
            } else {
                alert('No internship found for this skill. Showing all internships.');
            }

        }
    } else {
        id = jobsData.length;
        jobs = jobsData;
        headingText = 'Latest Jobs';

        if(skill) {
            let filterJobs = jobsData.filter((job) => {
                if (skill) {
                    return job.tags.find((tag) => tag.toLocaleLowerCase() === skill.toLocaleLowerCase());
                }
            })

            if(filterJobs.length > 0) {
                headingText = `Latest Jobs with #${skill} skill`;
                jobs = filterJobs;
            } else {
                alert('No jobs found for this skill. Showing all jobs.');
            }
        }
    }

    // Pagination logic
    const totalPages = Math.ceil(jobs.length / listingsPerPage);
    const startIndex = (currentPage - 1) * listingsPerPage;
    const endIndex = startIndex + listingsPerPage;
    const currentJobs = jobs.slice(startIndex, endIndex);

    currentJobs.forEach((job) => {
        str += jobsContentHtml(job, id--);
    });

    listingHeading.innerText = headingText;

    var pagination = document.getElementById('pagination');
    pagination.insertAdjacentHTML('beforebegin', str); // Add all jobs card to the DOM before the pagination element
    loader.classList.toggle('hidden'); // loading ends

    var currentPageDisplay = document.getElementById('currentPage');
    currentPageDisplay.innerText = currentPage;

    // Update the pagination buttons
    updatePaginationButtons(totalPages);

}

// Cookie accept handle function
function cookieAccept() {
    setItemToLocalStorage('cookie-accept', true)
    cookieModal.classList.add('hidden');
}

// When the user scrolls down 20px from the top of the document, show the button
function scrollFunction() {
    if (
        document.body.scrollTop > 20 ||
        document.documentElement.scrollTop > 20
    ) {
        backToTopBtn.style.display = "block";
    } else {
        backToTopBtn.style.display = "none";
    }
}

// When the user clicks on the button, scroll to the top of the document
function backToTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

// Copy to clipboard 
async function copyToClipboard(text) {
    await navigator.clipboard.writeText(text);
    alert("Copied to clipboard")
}

// Search form submit event
searchForm.addEventListener('submit', (event) => {
    let contentType = getItemFromLocalStorage('content');
    let skill = searchForm['skill'];
    event.preventDefault();
    changeContent(contentType, skill.value);
});

// Search form reset event
searchForm.addEventListener('reset', (event) => {
    event.preventDefault();
    if (searchForm['skill'].value === '') return;
    searchForm['skill'].value = '';
    changeContent(getItemFromLocalStorage('content'), null);
})

// Generate random hex
function randHex() {
    return (Math.floor(Math.random() * 56) + 200).toString(16);
}

// Generate random color
function randColor() {
    return randHex() + "" + randHex() + "" + randHex();
}

// Get item from local storage
function getItemFromLocalStorage(key) {
    return localStorage.getItem(key);
}

// Set item to local storage
function setItemToLocalStorage(key, value) {
    return localStorage.setItem(key, value);
}

// Function to update the pagination buttons
function updatePaginationButtons(totalPages) {
    const prevBtn = document.getElementById("prevPage");
    const nextBtn = document.getElementById("nextPage");

    // Show or hide the previous button based on the current page
    if (currentPage === 1) {
        prevBtn.disabled = true;
    } else {
        prevBtn.disabled = false;
    }

    // Show or hide the next button based on the current page
    if (currentPage === totalPages) {
        nextBtn.disabled = true;
    } else {
        nextBtn.disabled = false;
    }
}

// Event listener for the prevPage button
document.getElementById('prevPage').addEventListener('click', function() {
    if (currentPage > 1) {
        currentPage--;
        changeContent(getItemFromLocalStorage('content'), null);
    }
});

// Event listener for the nextPage button
document.getElementById('nextPage').addEventListener('click', function() {
    currentPage++;
    changeContent(getItemFromLocalStorage('content'), null);
});
