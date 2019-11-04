function showAddInner(form_visibility_element) {
    title_input_element = form_visibility_element.find(".task-title");

    form_visibility_element.show();
    title_input_element.focus();
}


function showAdd(add_link_element) {
    li_element = $(add_link_element).parent();
    form_visibility_element = li_element.children(".form-visibility-wrapper");
    showAddInner(form_visibility_element);
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
