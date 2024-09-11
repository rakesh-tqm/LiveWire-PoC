function ValidateEmail(mail) {
    
    if (
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
            myForm.emailAddr.value
        )
    ) {
        return true;
    }
    alert("You have entered an invalid email address!");
    return false;
}

    const ul = document.querySelector("ul"),
    input = document.querySelector("input.emails"),
    tagNumb = document.querySelector(".details span");


    multiTags = [];
addTag();

function createTag() {
    ul.querySelectorAll("li").forEach((li) => li.remove());
    multiTags
        .slice()
        .reverse()
        .forEach((tag) => {
            let liTag = `<li>${tag} <i class="uit uit-multiply" onclick="remove(this, '${tag}')"></i></li>`;
            ul.insertAdjacentHTML("afterbegin", liTag);
        });
}

function remove(element, tag) {
    let index = multiTags.indexOf(tag);
    multiTags = [...multiTags.slice(0, index), ...multiTags.slice(index + 1)];
    element.parentElement.remove();
    $("input[type=hidden].email_address").val(multiTags.join(","));
    // getAjaxPropertyList();
}

function addTag(e) {
    let tag = input.value.replace(/\s+/g, " ");
    if (tag.length > 1 && !multiTags.includes(tag)) {
        tag.split(",").forEach((tag) => {
            multiTags.push(tag);
            createTag();
        });
        $("input[type=hidden].email_address").val(multiTags.join(","));
    }
    console.log(multiTags);
    input.value = "";
}
