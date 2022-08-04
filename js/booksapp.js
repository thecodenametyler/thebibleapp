$(function() {
    if($('#' + bookapp.el.appId).length > 0){
        bookapp.init();
    }
});

let bookapp = {
    el: {
        debugger: true,
        appId: 'bookapp'
    },
    init: () => {
        if(!!bookapp.el.debugger) {
            console.log('bookapp init');
        }
        bookapp.generateBase(bookapp.el.appId);
    },
    generateBase: (appId)=> {
        if(!!bookapp.el.debugger) {
            console.log('bookapp generateBase', "#"+ appId);
        }
        if($('#' + appId).length > 0){
            let templ = `
            <div class="js-bookappTitle text-center"></div>
            <div class="js-bookappMenu text-center"></div>
            `;
            $('#' + appId).html(templ);
            
            bookapp.fetchBaseData(appId);
        }
    },
    fetchBaseData: (appId)=> {
        
        let dataUrl = './data/base.json';

        let urlParams = new URLSearchParams(window.location.search)
        if(urlParams.has("set")) {
            dataUrl = `./data/${urlParams.get("set")}.json`;
        }

        fetch(dataUrl,  {cache: "no-cache"}).then(response => {
            return response.json();
        }).then(data => {
            if(!!bookapp.el.debugger) {
                console.log(data);
            }
            let titlemarkup = '';
            let menumarkup = '';

            if(!!data.title) {
                document.title = data.title;
                titlemarkup += `
                    <h1>${data.title}</h1>
                `;
            }
            if(!!data.subtitle) {
                titlemarkup += `
                    <p>${data.subtitle}</p>
                `;
            }
            if (!!data.goback) {
                let backToHomeTitle = "Home";
                let backToHomeUrl = "/";
                if(!!data.goback.title) {
                    backToHomeTitle = data.goback.title;
                }
                if(!!data.goback.url) {
                    backToHomeUrl = data.goback.url;
                }
                titlemarkup += `
                    <a href="${backToHomeUrl}" title="${backToHomeTitle}">${backToHomeTitle}</a>
                `;
            }
            if(!!data.books) {
                menumarkup += `<h4>Menu:</h4>`;
                menumarkup += `<ol class="p-0 d-flex justify-content-center align-items-center flex-wrap flex-col">`;
                if(data.books.length > 0){
                    data.books.forEach((currentValue, index, arr)=> {
                        let itemTitleMarkup = '';
                        let itemUrl = '';
                        let linkMarkup = '';
                        let thumbnailMarkup = ''
                        let widelinkMarkup = ''
                        if (!!currentValue.title) {
                            itemTitleMarkup = currentValue.title;
                        }
                        if (!!currentValue.subtitle) {
                            itemTitleMarkup += " - " + currentValue.subtitle;
                        }
                        if (!!currentValue.url) {
                            itemUrl = currentValue.url;
                            widelinkMarkup = `<a class="widelink" href="${currentValue.url}" title="${itemTitleMarkup}"></a>`;
                        }
                        if (!!currentValue.thumbnail) {
                            thumbnailMarkup = `<img class="img-responsive" alt="${itemTitleMarkup}" src="${currentValue.thumbnail}" width="128"/>`;
                        }
                        
                        if (!!itemTitleMarkup) {
                            linkMarkup = `<a href="${itemUrl}" title="${itemTitleMarkup}">${itemTitleMarkup}</a>`;
                        }

                        menumarkup += `
                        <li class="m-1">
                            <div class="position-relative">
                                ${widelinkMarkup}${thumbnailMarkup}${linkMarkup}
                            </div>
                        </li>
                        `;
                    });
                }
                menumarkup += `</ol>`;
            }

            $('#' + appId).find('.js-bookappTitle').html(titlemarkup);
            $('#' + appId).find('.js-bookappMenu').html(menumarkup);
        }).catch(err => {
            console.error('fetchBaseData fail', err);
            // Do something for an error here
        });
    }
}