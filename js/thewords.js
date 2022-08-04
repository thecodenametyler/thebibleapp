$(function() {
    if($('#' + thewords.el.appId).length > 0){
        thewords.init();
    }
});

let thewords = {
    el: {
        debugger: true,
        appId: 'thewordsapp',
        book:{
            title: 'King James Version',
            path : '../kjv/data/kjv/',
            url : '../kjv'
        }
    },
    init: () => {
        if(!!thewords.el.debugger) {
            console.log('thewords init');
        }
        thewords.generateBase(thewords.el.appId);
    },
    generateBase: (appId)=> {
        if(!!thewords.el.debugger) {
            console.log('thewords generateBase', "#"+ appId);
        }
        if($('#' + appId).length > 0){
            let templ = `
            <div class="js-thewordsTitle text-center"></div>
            <div class="js-thewordsContent"></div>
            `;
            $('#' + appId).html(templ);
            
            thewords.fetchBaseData(appId);
        }
    },
    fetchBaseData: (appId)=> {
        
        let dataUrl = thewords.el.book.path + 'Books.json';

        let urlParams = new URLSearchParams(window.location.search)
        if(urlParams.has("book")) {
            if(!!thewords.el.debugger) {
                console.log('get book: ', urlParams.get("book"));
            }
            dataUrl = thewords.el.book.path + urlParams.get("book") + '.json';
        }

        //generate base app from dataUrl json
        fetch(dataUrl,  {cache: "no-cache"}).then(response => {
            return response.json();
        }).then(data => {
            if(!!thewords.el.debugger) {
                console.log(data);
            }

            let titleMarkup = '';
            let contentMarkup = '';


            let backToHomeTitle = "go back";
            let backToHomeUrl = "../";

            
            if(urlParams.has("book")) {
                
                if(!!data.book) {
                    titleMarkup += `
                        <h1>${data.book}</h1>
                    `;
                    let docTitle = document.title;
                    document.title = `${data.book} - ${docTitle}`;
                }
                if(!!data.subtitle) {
                    titleMarkup += `
                        <p>${data.subtitle}</p>
                    `;
                }
                backToHomeUrl = thewords.el.book.url;
                titleMarkup += `
                    <a href="${backToHomeUrl}" title="${backToHomeTitle}">${backToHomeTitle}</a>
                `;

                if(!!data.chapters) {
                    contentMarkup += `<ul class="p-0 d-flex justify-content-center align-items-center flex-wrap flex-col">`;
                    if(data.chapters.length > 0){
                        data.chapters.forEach((currentValue, index, arr)=> {
                            
                            let chapterMarkup = '';
                            let chaptertitleMarkup = '';
                            let chapterVersesMarkup = '';

                            if(!!currentValue.chapter) {
                                chaptertitleMarkup = `<h2 class="h3 theword__sticky__chapter" id="chapter-${currentValue.chapter}">${currentValue.chapter}</h2>`;
                            }
                            if(!!currentValue.verses) {
                                currentValue.verses.forEach((currentVerse, index, arr)=> {
                                    chapterVersesMarkup += `<p>${currentVerse.verse}. ${currentVerse.text}</p>`;
                                });
                            }

                            contentMarkup += `
                            <li class="m-2">
                                <div class="position-relative">
                                    ${chaptertitleMarkup}
                                    ${chapterVersesMarkup}
                                </div>
                            </li>
                            `;
                        });
                    }
                    contentMarkup += `</ol>`;
                }

            } else {

                //FROM BOOKS.JSON
                if(!!data.title) {
                    titleMarkup += `
                        <h1>${data.title}</h1>
                    `;
                }
                if(!!data.subtitle) {
                    titleMarkup += `
                        <p>${data.subtitle}</p>
                    `;
                }
                titleMarkup += `
                    <a href="${backToHomeUrl}" title="${backToHomeTitle}">${backToHomeTitle}</a>
                `;
                if(!!data.books) {
                    contentMarkup += `<ul class="p-0 d-flex justify-content-center align-items-center flex-wrap flex-col">`;
                    if(data.books.length > 0){
                        data.books.forEach((currentValue, index, arr)=> {
                            let itemtitleMarkup = '';
                            let itemChapterMarkup = '';
                            let itemUrl = '';
                            let linkMarkup = '';

                            if (!!currentValue.title) {
                                itemtitleMarkup = currentValue.title;
                            }
                            if (!!currentValue.subtitle) {
                                itemtitleMarkup += " ( " + currentValue.subtitle + " ) ";
                            }
                            if (!!currentValue.url) {
                                itemUrl = currentValue.url;
                            }
                            
                            if (!!itemtitleMarkup) {
                                linkMarkup = `<h2 class="h3 text-center"><a href="${itemUrl}" title="${itemtitleMarkup}">${itemtitleMarkup}</a></h2>`;
                            }

                            if (!!currentValue.totalchapters) {
                                itemChapterMarkup = `<ul class="p-0 d-flex justify-content-center align-items-center flex-wrap">`;
                                var limit = currentValue.totalchapters;
                                while (limit > 0) {
                                    --limit;
                                    let currChapter = currentValue.totalchapters - limit;
                                    let chapUrl = itemUrl+'&chapter='+currChapter;
                                    itemChapterMarkup += `<li><a class="btn p-1" href="${chapUrl}">${ currChapter }</a></li>`;
                                }
                                itemChapterMarkup += `</ul>`;
                            }

                            if(!!!linkMarkup) {
                                if(!!currentValue) {
                                    linkMarkup = currentValue;
                                }
                            }

                            contentMarkup += `
                            <li class="m-1">
                                <div class="position-relative">
                                    ${linkMarkup}
                                    ${itemChapterMarkup}
                                </div>
                            </li>
                            `;
                        });
                    }
                    contentMarkup += `</ol>`;
                }

            }

            $('#' + appId).find('.js-thewordsTitle').html(titleMarkup);
            $('#' + appId).find('.js-thewordsContent').html(contentMarkup);

            
            if(urlParams.has("book")) {
                $('#' + appId).find('.js-thewordsTitle').addClass('theword__sticky__title');
            }

            if(urlParams.has("book") && urlParams.has("chapter")) {
                if($('#chapter-'+urlParams.get("chapter")).length > 0) {
                    if(!!thewords.el.debugger) {
                        console.log($('#chapter-'+urlParams.get("chapter")));
                    }
                    if(urlParams.get("chapter") > 1) {
                        $('html').animate({
                            scrollTop: $('#chapter-'+urlParams.get("chapter")).offset().top
                        }, 1000, "linear", function() {
                            setTimeout(() => {
                                window.scrollBy(0, -108);
                            }, 1100);
                        });
                    }
                    
                }
            }
        }).catch(err => {
            console.error('fetchBaseData fail', err);
            // Do something for an error here
        });
    }
}