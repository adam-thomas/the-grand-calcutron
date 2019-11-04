function showAddInner(form_visibility_element) {
    title_input_element = form_visibility_element.find(".task-title");

    form_visibility_element.addClass("show");
    title_input_element.focus();
}


function showAdd(task_id) {
    form_visibility_element = $("#add-form-of-" + task_id);
    showAddInner(form_visibility_element);
}


function hideAdd(task_id) {
    form_visibility_element = $("#add-form-of-" + task_id);
    form_visibility_element.removeClass("show");
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
        showAddInner(
            $(siblings_list_id).children(".task-form-wrapper").children(".form-visibility-wrapper")
        );
    });
}


$(document).ready(() => {
    // Display the first tab.
    showTab($("nav").children("button")[0]);
})
