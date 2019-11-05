function showAddInner(children_element) {
    title_input_element = children_element.children(".task-form-wrapper").find(".task-title");

    children_element.addClass("show");
    title_input_element.focus();
}


function toggleChildren(button_element, task_id) {
    children_element = $("#children-of-" + task_id);

    if (children_element.hasClass("show")) {
        children_element.removeClass("show");
        $(button_element).html("v");
    } else {
        showAddInner(children_element);
        $(button_element).html("^");
    }
}


function showTab(tab_element) {
    $("nav button").removeClass("active");
    $(tab_element).addClass("active");

    let id = $(tab_element).attr("id");

    $(".tab-contents-container").removeClass("show");
    $(".tab-contents-container#container-of-" + id).addClass("show");
    $(".form-visibility-wrapper#add-form-of-" + id).addClass("show");
}


function parseForm(form_element) {
    results = {};
    let input_elements = $(form_element).find("input");

    for (let input of input_elements) {
        results[$(input).attr("name")] = $(input).val();
    }
    return results;
}


function submitAjaxForm(event, form_element, target_url) {
    event.preventDefault();
    data = parseForm(form_element);

    $.post(target_url, data, (return_data, status) => {
        siblings_list_id = "#children-of-" + data.parent;
        $(siblings_list_id).replaceWith(return_data);
        showAddInner($(siblings_list_id));
    });
}


$(document).ready(() => {
    // Display the first tab.
    showTab($("nav").children("button")[0]);
})
