
/*адрес сервера с API*/
window.startUrl = 'http://www.forum-nnov.ru/api/retail/';
/*уникальный идентификатор устройства (НЕ IMAI!!!)*/
window.deviceId = '';
/*флаг интернета*/
window.connection = false;
/*количество единовременно загружаемых позиций*/
window.itemsCount = 10;

/*флаг авторизации*/
window.autch = false;

/*фильтр отбора(объект)*/
window.filter = {};

/*для совместимости jqury*/
var $$ = Dom7;


/*ждем готовность устройства*/
document.addEventListener("deviceready",onRd,false);

function onRd(){
    
    window.myApp = new Framework7({
        animateNavBackIcon:true,
            pushState: true,
            pushStateSeparator:'#page/',
            modalButtonOk: 'Подвердить',
            modalButtonCancel: 'Отменить',
            smartSelectBackText: 'Назад',
            smartSelectPopupCloseText: 'Закрыть',
            smartSelectPickerCloseText: 'Закрыть',
            swipeBackPage: true,
            sortable: false,
            swipeout: true,
            swipePanel: 'left',
            router: true,
            cache: false,
            dynamicPageUrl: 'content-{{name}}',
    });

    // Add view
    window.mainView = window.myApp.addView('.view-main',{
      dynamicNavbar: true,
      //reloadPages: true
    });
    
    /*проверяем авторизацию и интернет*/
    checkConnection();
    checkAutch();
    

    window.myApp.onPageBeforeInit('*', function (page){
        if(typeof initPageBeforeLoadCallback == 'function'){
                initPageBeforeLoadCallback(page);
        }
    })

    myApp.onPageInit('*', function (page){
        if(typeof initPageLoadCallback == 'function'){
                initPageLoadCallback(page);
        }
    })

    if(typeof device != 'undefined'){
            window.deviceId = device.uuid;
    }else{
            function makeid(){
                    var text = "";
                    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                    for( var i=0; i < 12; i++ )
                            text += possible.charAt(Math.floor(Math.random() * possible.length));
                    return text;
            }
            window.deviceId = localStorage.getItem('device_id');
            if(!window.deviceId) {
                    window.deviceId = makeid();
                    localStorage.setItem('device_id',window.deviceId);
            }
    }
    



    /*загружаем начальную страничку*/
    if(window.autch){
        /*Усли пользак авторизован*/
        if(window.connection){
            /*обновляем данные и рисуем страничку*/
            getMainPageConect();
        }else{
            /*рисуем страничку со старыми данными, иначе пишем, что недоступна*/
            getMainPageDisConect();
        }
    }else{
        /*усли пользак не авторизован*/
        if(window.connection){
            /*открываем страничку с авторизацией*/
            mainView.router.load({
                url: 'tmpl/autch.html',
                animatePages: false
            });
        }else{
            /*сообщаем от ошибке подключения к интернету*/
            mainView.router.load({
                url: 'tmpl/noconect.html',
                animatePages: false
            });
        }
    }
 
}


/*проверяем соединение c интернетом*/
function checkHistory(pege){

    var historyPage = [];
    var cntHistory = 0;
    var conect = "N";
    
    checkConnection();
    if(window.connection) conect = "Y";
    
    if(localStorage.getItem("historyPage") != null){
        var historyPage = JSON.parse(localStorage.getItem("historyPage"));
        cntHistory = historyPage.length;
    }

    historyPage[cntHistory] = {
        conect: conect,
        page: pege,
        dateView: Math.round(new Date().getTime() / 1000)
    };

    if(conect == "N"){
        localStorage.setItem ("historyPage", JSON.stringify(historyPage));
    }else{

        $$.ajax({
            url : window.startUrl+"history/",
            data : {device:window.deviceId, key: localStorage.getItem('authorize_key'), historyPage:historyPage},
            dataType: 'json',
            timeout: 5000,
            success : function(data){ 

                window.connection = true;
                if(data.status == "ok"){
                    localStorage.removeItem("historyPage");
                }else{
                    historyPage[cntHistory] = {
                        conect: "N",
                    };
                    localStorage.setItem ("historyPage", JSON.stringify(historyPage));
                }
            },
            error: function(data){
                window.connection = false;
                historyPage[cntHistory] = {
                    conect: "N",
                };
                localStorage.setItem ("historyPage", JSON.stringify(historyPage));
            }
        }); 
    }
}

/*проверяем авторизацию пользака*/
function checkAutch(){
    window.autch = false;
    if(localStorage.getItem("authorize_key") != null){
        window.autch = true;
    }
}

function menuAutchHide(){
    var s;
    if(window.autch){
        s=document.getElementsByClassName('no_autch');
    }else{
        s=document.getElementsByClassName('autch');
    }
    for (i=0;i<s.length;i++) {
        s[i].style.display="none";
    };
}


/*проверяем соединение c интернетом*/
function checkConnection(){

	if(typeof navigator.connection != 'undefined'){
	
	var Connection = {
		UNKNOWN: "unknown",
        ETHERNET: "ethernet",
        WIFI: "wifi",
        CELL_2G: "2g",
        CELL_3G: "3g",
        CELL_4G: "4g",
        CELL:"cellular",
        NONE: "none"
	};
	var networkState = navigator.connection.type;
    var states = {};
    states[Connection.UNKNOWN]  = true;
    states[Connection.ETHERNET] = true;
    states[Connection.WIFI]     = true;
    states[Connection.CELL_2G]  = true;
    states[Connection.CELL_3G]  = true;
    states[Connection.CELL_4G]  = true;
    states[Connection.CELL]     = true;
    states[Connection.NONE]     = false;

    if(states[networkState]===true) {
		window.connection = states[networkState];
	}else if(states[networkState]===false){
		window.connection = states[networkState];
	}else{
		window.connection = true;
	}
	}else{
	window.connection = true;
	}
        

	
}


/*----------------пользовательские функции-------------------*/

/*функция обработки динамических страничек*/
function getDinamicPageLoad(page,id){
    
}


/*функция возникает сразу после загрузки страницы*/
function initPageLoadCallback(page){
    /*скрываем ссылки от авторизации*/
    menuAutchHide();
}


/*чистим телефон*/
function checkPhoneNumber(phone){
    phone = phone.replace(/[^0-9]/gim,'');
    if(phone.length < 10)
        return false;
    
    phone = phone.substr(-10);
    return phone;
}

/*добавляем параметры фильтрации*/
function urlparam(filter, page){
    if(page === undefined){ page = 1; }
        var url = '?page='+page+'&pageSize='+window.itemsCount;
        var param = "";
        var count = false;
        for (var key in filter) {
            if(window.filter[key] !==""){
                if(count ===true)
                    param +="&";
                
                param += key+"="+filter[key];
                count = true;
            }
        }
        if(param !=="")
            url +="&"+param;
        
        return url;
}










/*-----------------Ловим события----------------------------------------*/


/*ссылки на динамические странички*/
$$(document).on('click','.dinamic',function(e){
    e.preventDefault();

    var page = $$(this).attr("href").replace("#content-","");

    if(typeof getDinamicPageLoad == 'function'){
        getDinamicPageLoad(page);
    }
});

/*ссылки на странички со статистикой конкретных магазинов*/
$$(document).on('click','.store_lnk',function(e){
    e.preventDefault();

    var store_id = $$(this).attr("data-store_id");
    if(typeof getRequest === 'function'){
        var url = window.startUrl+'stat/'+store_id+'/'+urlparam(window.filter);
        getRequest("storepege", url);
    }
});


/*-----------------авторизация------------------------------*/

$$(document).on('click', '#form_phone_link_code', function(e){
        e.preventDefault();
        $$('#form_phone_error').html('').hide();

        var formData = window.myApp.formToJSON('#form_phone');
        formData.device = window.deviceId;
        if (formData.phone.length <=0){
            $$('#form_phone_error').html('<p class="error__page">Незаполнен телефон</p>').show();
            $$('#form_phone_filds_phone i').addClass('color-red');
            $$('#form_phone_filds_phone input').addClass('error');
            return false;
        }
        
        formData.phone = checkPhoneNumber(formData.phone);
        if(formData.phone === false){
            $$('#form_phone_error').html('<p class="error__page">Неверен формат телефона</p>').show();
            $$('#form_phone_filds_phone i').addClass('color-red');
            $$('#form_phone_filds_phone input').addClass('error');
            return false;
        }
        $$.ajax({
            url : window.startUrl+"autch/?step=code&type=phone",
            data : formData,
            dataType: 'json',
            timeout: 5000,
            async : false,
            success : function(data){ 

                if(!data.error){
                        $$('#form_phone_link_code').hide();
                        $$('#form_phone_filds_phone').hide();
                        
                        $$('#form_phone_link_autch').show();
                        $$('#form_phone_filds_code').show();

                }else{
                        $$('#form_phone_error').html('<p class="error__page">'+data.error+'</p>').show();
                }
            },
            error: function(){

                $$('#form_phone_error').html('<p class="error__page">Ошибка авторизации. Нет соединения с сервером.</p>').show();
            }
        });
});
$$(document).on('click', '#form_phone_link_autch', function(e){
        e.preventDefault();
        $$('#form_phone_error').html('').hide();

        var formData = window.myApp.formToJSON('#form_phone');
        formData.device = window.deviceId;
        if (formData.phone.length <=0){
            $$('#form_phone_error').html('<p class="error__page">Незаполнен телефон</p>').show();
            $$('#form_phone_filds_phone i').addClass('color-red');
            $$('#form_phone_filds_phone input').addClass('error');
            return false;
        }
        
        formData.phone = checkPhoneNumber(formData.phone);
        if(formData.phone === false){
            $$('#form_phone_error').html('<p class="error__page">Неверен формат телефона</p>').show();
            $$('#form_phone_filds_phone i').addClass('color-red');
            $$('#form_phone_filds_phone input').addClass('error');
            return false;
        }
        
        if (formData.phone.length <=0 && formData.phone.length >4){
            $$('#form_phone_error').html('<p class="error__page">Неверный код подтверждения</p>').show();
            $$('#form_phone_filds_code i').addClass('color-red');
            $$('#form_phone_filds_code input').addClass('error');
            return false;
        }
        
        $$.ajax({
            url : window.startUrl+"autch/?step=autch&type=phone",
            data : formData,
            dataType: 'json',
            timeout: 5000,
            async : false,
            success : function(data){ 
                if(!data.error){
                        /*записываем ключ авторизации*/
                        localStorage.setItem('authorize_key',data.token);
                        /*загружаем главную*/
                        getMainPageConect();
                }else{
                        $$('#form_phone_error').html('<p class="error__page">'+data.error+'</p>').show();
                }
            },
            error: function(){

                $$('#form_phone_error').html('<p class="error__page">Ошибка авторизации. Нет соединения с сервером.</p>').show();
            }
        });
});

/*гбираем ошибки с полей*/
$$(document).on('click', 'input.error', function(){
    $$('#form_phone_error').html('').hide();
    $$(this).find('i').removeClass('color-red');
});


/*принудительное обновление статистики*/
$$(document).on('click', '.stat_refresh', function(e){
    e.preventDefault();
    /*Подгружаем данные с сервера*/
    getRequestDataMain();
});


/*-------------------------события фильтра-начало-----------------------------*/
/*Кнопка фильтра ПРИМЕНИТЬ*/
$$(document).on('click', '#save_filter', function(e){
    e.preventDefault();
    /*получаем идентификатор категории(магазина в данном случае)*/
    var store_id = $$(this).attr('data-store_id');
    
    /*получаем данные с формы фильтра даты и приводим в нужный формат(тупо как строку-хак)*/
    var formData = window.myApp.formToJSON('#filter_store');
    var startdata = formData.startdata;
    window.filter.startdata = startdata.split("-").reverse().join(".");
    
    var enddata = formData.enddata;
    window.filter.enddata = enddata.split("-").reverse().join(".");
    
    /*вормируем url*/
    if(typeof getRequest === 'function'){
        var url = window.startUrl+'stat/'+store_id+'/'+urlparam(window.filter);
        window.myApp.closeModal('.popup-store');
        getRequest("storefilter", url);
    }

});


/*Сбросить фильтр*/
$$(document).on('click', '#clear_filter', function(e){
    e.preventDefault();
    /*получаем идентификатор категории(магазина в данном случае)*/
    var store_id = $$('#save_filter').attr('data-store_id');
    
    /*получаем данные с формы фильтра даты и приводим в нужный формат(тупо как строку-хак)*/
    window.filter = {};
    
    /*вормируем url*/
    if(typeof getRequest === 'function'){
        var url = window.startUrl+'stat/'+store_id+'/'+urlparam();
        window.myApp.closeModal('.popup-store');
        getRequest("storefilter", url);
    }

});
/*-------------------------события фильтра-конец-----------------------------*/

/*открываем окно с фильтром*/
$$(document).on('click', '.create-popup', function(e){
    var html = tmpl_popup_filter();
    window.myApp.popup(html);
});


/*-------------------динамические странички---------------------*/
/*формируем главну, проверяем контент*/
function getMainPageConect(){
    var requestConect = localStorage.getItem("requestConect");
    if((requestConect != null && (Math.round(new Date().getTime() / 1000)-900) > requestConect) || requestConect === null){
        /*Подгружаем данные с сервера*/
        getRequestDataMain();
    }else{
        /*берем сохраненные данные*/
        var statik_avalon = JSON.parse(localStorage.getItem("statik_avalon"));
        /*загружаем данные в шаблон*/
        var html = tmpl_main(statik_avalon);
        mainView.router.loadContent(html);
    }
}
/*запрос данных и формирование главной()*/
function getRequestDataMain(){

    $$.ajax({
            url : window.startUrl+"stat/",
            data : {device:window.deviceId, key: localStorage.getItem('authorize_key')},
            dataType: 'json',
            timeout: 5000,
            success : function(data){ 

                if(!data.error){

                    localStorage.setItem ("statik_avalon", JSON.stringify(data));
                    localStorage.setItem ("requestConect", Math.round(new Date().getTime() / 1000));
                    var html = tmpl_main(data);
                    mainView.router.loadContent(html);
                }
                if(data=== null){
                    var er_text = "Нет данных на сервере";
                    var html = tmpl_error(er_text);
                    mainView.router.loadContent(html);
                }
            },
            error: function(data){
                    var er_text = "Нет coeдинения с сервером";
                    var html = tmpl_error(er_text);
                    mainView.router.loadContent(html);
                    
            }
    }); 
}

/*запрос для получения динамического контента в формате json*/
function getRequest(type, url){

        $$.ajax({
            url : url,
            data : {device:window.deviceId, key: localStorage.getItem('authorize_key')},
            dataType: 'json',
            timeout: 5000,
            success : function(data){ 

                if(type === "storepege"){
                    getStorePege(data);
                }
                if(type === "storelist"){
                    getStoreList(data);
                }
                if(type === "storefilter"){
                    getStoreFilter(data);
                }
                
            },
            error: function(){
                    window.connection = false;
            }
        });                

}

/*функция для применения фильтра(чтоб не перезагружать страницы(баг на андройде при срабатывании кнопки назад))*/
function getStoreFilter(data){
    window.myApp.detachInfiniteScroll($$('.infinite-scroll'));
    var html = tmpl_store_filter(data);

    $$('.pages').children(':last-child').find('.page-content').remove('.page-content');
    $$('.pages').children(':last-child').append(html);
    
    if(data.body.length >= window.itemsCount){
        window.loading = false;
        window.myApp.attachInfiniteScroll($$('.infinite-scroll'))
        getStoreInfinite();
    }
}

/*формируем страничку деталировки статистики магазина*/
function getStorePege(data){
    window.myApp.detachInfiniteScroll($$('.infinite-scroll'));
    var html = tmpl_store(data);
    mainView.router.loadContent(html);
    
    if(data.body.length >= window.itemsCount){
        window.loading = false;
        getStoreInfinite();
    }
}


/*заполнение данных динамической страницы по скролу*/
function getStoreInfinite(){
    $$(document).on('infinite', '.infinite-scroll', function(e){

        /*если незакончена подрузка не реагируем*/
        if(loading) return;

        window.loading = true;
        var lastIndex = $$('.pages').children(':last-child').find('.infinite-scroll .list-block li').length;
        var page_count = lastIndex / window.itemsCount + 1;

        var store_id = $$('.pages').children(':last-child').find('.create-popup').attr("data-store");
        if(typeof getRequest === 'function'){
            var url = window.startUrl+'stat/'+store_id+'/'+urlparam(window.filter, page_count);
            getRequest("storelist", url);
        }
        
    });
}


/*дозагрузка элементов списка*/
function getStoreList(data){

        if(data.body.length < window.itemsCount){
            //Если лимит достигнут, снимаем событие загрузки
            window.myApp.detachInfiniteScroll($$('.infinite-scroll'));
            //Удалить прелоадер
            $$('.infinite-scroll-preloader').remove();
        }
        
        // Генерируем новый хтмл HTML
        var html = tmpl_store_list(data);
        //Добавляем элементы в конец списка
        $$('.pages').children(':last-child').find('.infinite-scroll .list-block ul').append(html);
        window.loading = false;
}

/*шаблон главной*/
tmpl_main = (function(data){
    var requestConect = localStorage.getItem("requestConect")*1000;
    var dConect =  new Date(requestConect)
        // Генерируем новый хтмл HTML
        var html ='<div class="navbar">'
                    +'<div class="navbar-inner">'
                        +'<div class="left"><a href="#" class="link icon-only open-panel"><i class="icon icon-bars"></i></a></div>'
                        +'<div class="center sliding">Отчеты</div>'
                        +'<div class="right"></div>'
                    +'</div>'
                +'</div>'
                +'<div class="pages">'
                    +'<div data-page="main" class="page no-swipeback no-animation">'
                        +'<div class="page-content">'
                            +'<div class="card">'
                                    +'<div class="card-header row">'
                            
                            
                                        +'<div class="col-70">Статистика Авалон</div>'
                                        +'<div class="col-15">'+dConect.getHours()+':'+dConect.getMinutes()+'</div>'
                                        +'<div class="col-15"><a href="#" class="stat_refresh"><i class="fa fa-refresh" aria-hidden="true"></i></a></div>'
                            
                                    +'</div>'
                                    +'<div class="card-content">'
                                        +'<div class="card-content">'
                                            +'<div class="list-block media-list">'
                                                +'<ul>';

        $$.each(data.body, function (index, value){
        html +='<li>'
                +'<a href="#content-stat" data-store_id="'+value.store_id+'" class="item-link item-content store_lnk">'
                    +'<div class="item-media">'
                        +'<img src="http://'+value.images+'" width="44">'
                    +'</div>'
                    +'<div class="item-inner">'
                        +'<div class="item-title-row">'
                            +'<div class="item-title">'+value.alias+'</div>'
                        +'</div>'
                        +'<div class="item-subtitle">'
                            +'<div class="row">'
                                +'<div class="col-33">'+value.visitors+'чел</div>'
                                +'<div class="col-33">'+value.sales+'чел</div>'
                                +'<div class="col-33">'+value.summ+'р.</div>'
                            +'</div>'
                        +'</div>'
                    +'</div>'
                +'</a>'
                +'</li>';
        });
        
         html +=                        '</ul>'
                                    +'</div>'            
                                +'</div>'
                            +'</div>'
                            +'<div class="card-footer">визиты/покупки/сумма</div>'
                        +'</div>'
                    +'</div>'
                +'</div>'
            +'</div>';
        return html;
});

/*шаблон статистики помагазинно*/
tmpl_store = (function(data){
        // Генерируем новый хтмл HTML
        var html ='<div class="navbar">'
                    +'<div class="navbar-inner">'
                        +'<div class="left"><a href="#" class="back link"><i class="icon icon-back"></i><span>Назад</span></a></div>'
                        +'<div class="center sliding">Магазины</div>'
                        +'<div class="right"><a href="#" data-panel="right" class="link icon-only open-panel"><i class="icon f7-icons">more</i></a></div>'
                    +'</div>'
                +'</div>'
                
                +'<div class="pages">'
                    +'<div data-page="store" class="page">'
                        +'<a href="#" data-store="'+data.body[0].store_id+'" class="floating-button color-red create-popup"><i class="icon f7-icons">more</i></a>';
        if(data.body.length >= window.itemsCount){
            html += '<div class="page-content infinite-scroll" data-distance="100">';
        }else{
            html += '<div class="page-content">';
        }
        html +=                '<div class="card">'
                                    +'<div class="card-header row">'+data.body[0].alias+'</div>'
                                    +'<div class="card-content">'
                                        +'<div class="list-block media-list">'
                                            +'<ul>';
    /*подставляем элементы*/
    html += tmpl_store_list(data);

     html +=                        '</ul>'
                                +'</div>'
                            +'</div>'
                            //+'<div class="card-footer">визиты/покупки/сумма</div>'
                        +'</div>';
        if(data.body.length >= window.itemsCount){
            html +='<div class="infinite-scroll-preloader"><div class="preloader"></div></div>';
        }
        html +=     '</div>'
                +'</div>'
            +'</div>';
        return html;
});

/*шаблон-вставка для фильтрации*/
tmpl_store_filter = (function(data){
        // Генерируем новый хтмл HTML
        var html = '';
        if(data.body.length >= window.itemsCount){
            html += '<div class="page-content infinite-scroll" data-distance="100">';
        }else{
            html += '<div class="page-content">';
        }
        html +=                '<div class="card">'
                                    +'<div class="card-header row">'+data.body[0].alias+'</div>'
                                    +'<div class="card-content">'
                                        +'<div class="list-block media-list">'
                                            +'<ul>';
    /*подставляем элементы*/
    html += tmpl_store_list(data);

     html +=                        '</ul>'
                                +'</div>'
                            +'</div>'
                            //+'<div class="card-footer">визиты/покупки/сумма</div>'
                        +'</div>';
        if(data.body.length >= window.itemsCount){
            html +='<div class="infinite-scroll-preloader"><div class="preloader"></div></div>';
        }
        html +=     '</div>';
        return html;
});

/*шаблон главной*/
tmpl_error = (function(data){
        var html ='<div class="navbar">'
                    +'<div class="navbar-inner">'
                        +'<div class="left"><a href="#" class="link icon-only open-panel"><i class="icon icon-bars"></i></a></div>'
                        +'<div class="center sliding">Ошибка!</div>'
                        +'<div class="right"></div>'
                    +'</div>'
                +'</div>'
                +'<div class="pages">'
                    +'<div data-page="main" class="page no-swipeback no-animation">'
                        +'<div class="page-content">'
                            +'<div class="card">'
                                +'<div class="card-content">'
                                    +'<p>'+data+'</p>'
                                +'</div>'
                            +'</div>'
                        +'</div>'
                    +'</div>'
                +'</div>';
        return html;
});

/*шаблон статистики помагазинно*/
tmpl_store_list = (function(data){
        var html = "";
        $$.each(data.body, function (index, value) {
        html +='<li>'
                    +'<div class="item-inner card-content-inner">'
                        +'<div class="item-title-row">'
                            +'<div class="item-title">'+value.data+'</div>'
                        +'</div>'
                        +'<div class="item-subtitle">'
                            +'<div class="row">'
                                +'<div class="col-33">'+value.visitors+'чел</div>'
                                +'<div class="col-33">'+value.sales+'чел</div>'
                                +'<div class="col-33">'+value.summ+'р.</div>'
                            +'</div>'
                        +'</div>'
                    +'</div>'
                +'</li>';
        });
        return html;
});

/*шаблон окна фильтра*/
tmpl_popup_filter = (function(){

    var store_id = $$('.create-popup').attr('data-store');
    var enddata = "";
    var startdata = "";
    if(typeof window.filter.startdata !== 'undefined'){
        startdata = window.filter.startdata;
        startdata = startdata.split(".").reverse().join("-");
    }
    if(typeof window.filter.enddata !== 'undefined'){
        enddata = window.filter.enddata;
        enddata = enddata.split(".").reverse().join("-");
    }
    var html = '<div class="popup popup-store">'
                    +'<div class="content-block-title">Фильтр по дате</div>'
                    +'<form id="filter_store" class="card-content-inner">'
                            +'<div class="content-block accordion-list custom-accordion">'
                                +'<div class="accordion-item">'
                                    +'<div class="accordion-item-toggle">'
                                        +'<i class="icon icon-plus">+</i>'
                                        +'<i class="icon icon-minus">-</i>'
                                        +'<span>Начало периода</span>'
                                    +'</div>'
                                    +'<div class="accordion-item-content">'
                                        +'<div class="list-block">'
                                            +'<ul>'
                                                +'<li>'
                                                    +'<div class="item-content">'
                                                        +'<div class="item-media"><i class="icon f7-icons">calendar</i></div>'
                                                        +'<div class="item-inner">'
                                                            +'<div class="item-input">'
                                                                +'<input name="startdata" type="date" value="'+startdata+'">'
                                                            +'</div>'
                                                        +'</div>'
                                                    +'</div>'
                                                +'</li>'
                                            +'</ul>'
                                        +'</div>'
                                    +'</div>'
                              +'</div>'
                              +'<div class="accordion-item">'
                                    +'<div class="accordion-item-toggle">'
                                        +'<i class="icon icon-plus">+</i>'
                                        +'<i class="icon icon-minus">-</i>'
                                        +'<span>Конец периода</span>'
                                    +'</div>'
                                    +'<div class="accordion-item-content">'
                                        +'<div class="list-block">'
                                            +'<ul>'
                                                +'<li>'
                                                    +'<div class="item-content">'
                                                        +'<div class="item-media"><i class="icon f7-icons">calendar</i></div>'
                                                        +'<div class="item-inner">'
                                                            +'<div class="item-input">'
                                                                +'<input name="enddata" type="date" value="'+enddata+'">'
                                                            +'</div>'
                                                        +'</div>'
                                                    +'</div>'
                                                +'</li>'
                                            +'</ul>'
                                        +'</div>'
                                    +'</div>'
                              +'</div>'
                            +'</div>'
                    +'</form>'
            +'<div class="content-block-inner">'
                +'<div class="card-content-inner row">'
                    +'<div class="col-100"><a href="#" id="clear_filter" class="button color-red">Очистить</a></div>'
                +'</div>'
                +'<div class="card-content-inner row">'
                    +'<div class="col-50"><a href="#" class="button color-red close-popup">Закрыть</a></div>'
                    +'<div class="col-50"><a href="#" data-store_id="'+store_id+'" id="save_filter" class="button button-fill color-red">Применить</a></div>'
                +'</div>'
            +'</div>'
            
            
                  +'</div>';
    return html;
});