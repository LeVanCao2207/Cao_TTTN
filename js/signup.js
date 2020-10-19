//Hàm Signup
function signup(options){

    function getParent(element, selector){
        while(element.parentElement){
            if (element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorRules = {};
    //Hàm thực hiện validate
    function validate(inputElement,rule){
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
        var errorMessage;

        //Lấy ra rules của selector
        var rules = selectorRules[rule.selector];
        
        //Lặp qua từng rule & check
        //Nếu có lỗi thì dừng check
        for(var i = 0; i < rules.length; ++i){
            switch(inputElement.type){
                case 'checkbox':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            if (errorMessage) break;
        }
        
        if(errorMessage){
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');
        }else {
            errorElement.innerText ='';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
        }

        return !errorMessage;
    }

    //lấy formEmlment cần validate
    var formElement = document.querySelector(options.form);
    if(formElement){
        //khi submit form
        formElement.onsubmit = function(e){
            e.preventDefault();

            var isFormValid = true;
            //Lặp qua từng rule và validate
            options.rules.forEach(function (rule){
                var inputElement = formElement.querySelector(rule.selector);
                
                var isValid = validate(inputElement,rule);
                if(!isValid){
                    isFormValid = false;
                }
            });
           
            if (isFormValid){
                //Trường hợp submit với js
                if (typeof options.onSubmit === 'function'){
                    var enableInputs = formElement.querySelectorAll('[name]');

                    var formValues = Array.from(enableInputs).reduce(function(values, input){
                        values[input.name] = input.value;

                        switch(input.type){
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            case 'checkbox':
                                if(input.matches(':checked')) return values;

                                if(!Array.isArray(values[input.name])){
                                    values[input.name] = [];
                                }

                                values[input.name].push(input.value);
                                break;
                            case 'file':
                                values[input.name] = input.files;
                            default:
                                values[input.name] = input.value;
                        }

                        return values;
                    }, {});
                    options.onSubmit(formValues);
                }
                // Submit với hành vi mặc định
                else{
                    formElement.submit();
                }
            }
        }
        //lặp qua mỗi rule và xử lý (lắng nghe sự kiện blur, input,... )
        options.rules.forEach(function (rule){

            // Lưu lại rules cho mỗi input
            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test);
            }else {
                selectorRules[rule.selector] = [rule.test];
            }
            
            var inputElements = formElement.querySelectorAll(rule.selector);
            
            Array.from(inputElements).forEach(function (inputElement){
                //xử lý trường hợp blur ra ngoài.
                inputElement.onblur = function(){
                    validate(inputElement,rule);
                }

                //xử lý trường hợp mỗi khi người dùng nhập vào input
                inputElement.oninput = function(){
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector('.form-message');
                    errorElement.innerText ='';
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                }
            });
            
            //Lấy value từ user nhập vào: inputElement.value
            //Lấy hàm để kiểm tra: rule.test
        });
    }
}
//Định nghĩa rules
//Nguyên tắc của rules: 
//1. Khi có lỗi => báo lỗi
//2. Hợp lệ => không trả về gì.
signup.isRequired = function(selector, message){ 
    return {
        selector: selector,
        test: function(value){ //kiểm tra xem người dùng đã nhập chưa
            var nameRegex = /^[a-z0-9_-]{6,16}$/;
            return nameRegex.test(value) ? undefined : message || 'Please enter valid information';
        }
    }
}
signup.isEmail = function(selector, message){
    return {
        selector: selector,
        test: function(value){ //kiểm tra xem có phải là email hay không
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Please enter email';
        }
    }
}
signup.minLength = function(selector, min, message){
    return {
        selector: selector,
        test: function(value){
            return value.length >= min ? undefined : message || `Please enter minimum ${min} characters`;
        }
    }
}
signup.isConfirmed = function(selector, getConfirmValue, message){
    return {
        selector: selector,
        test: function (value){
            return value === getConfirmValue() ? undefined : message || 'The input value is incorrect';
        }
    }
}