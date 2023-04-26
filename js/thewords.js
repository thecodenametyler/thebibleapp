$(function() {
    if($('#' + thewords.el.appId).length > 0){
        thewords.init();
    }
});

let thewords = {
    el: {
        debugger: false,
        appId: 'thewordsapp',
        sourcePathField: '#sourcePath',
        backPathField: '#backPath',
        bookJsonPathField: '#bookJsonPath',
        book:{
            title: 'King James Version',
            path : '../kjv/data/kjv/',
            url : '../kjv',
            bookJson: './louis-segond-formatted.json',
        },
        storage: {
            chaptersVerses: [],
            book: ''
        }
    },
    init: () => {
        if(!!thewords.el.debugger) {
            console.log('thewords init');
        }
        thewords.initSearchDB();

        setTimeout(() => {
            
            let urlParams = new URLSearchParams(window.location.search);
            if(urlParams.has("present")) {
                //DO presentation
                let verse = urlParams.get("verse");
                thewords.searchVerse(verse, 'present');
            } else {
                //DO generate base
                thewords.generateBase(thewords.el.appId);
            }

        }, 300);
        // thewords.bookParser('Matthieu');
    },
    generateBase: (appId)=> {
        if(!!thewords.el.debugger) {
            console.log('thewords generateBase', "#"+ appId);
        }

        if($('#' + appId).length > 0){
            let templ = `
            <div class="js-thewordsHeader theword__header">
                <div class="js-thewordsTitle text-center"></div>
                <div class="js-thewordsSearchWrapper"></div>
            </div>
            <div class="js-thewordsContent theword__content"></div>
            `;
            $('#' + appId).html(templ);
            
            thewords.fetchBaseData(appId);
        }
    },
    fetchBaseData: (appId)=> {
        let sourcePath = thewords.el.book.path;
        if($(thewords.el.sourcePathField).length > 0) {
            sourcePath = $(thewords.el.sourcePathField).val();
        }
        
        let dataUrl = sourcePath + 'Books.json';

        let urlParams = new URLSearchParams(window.location.search);
        if(urlParams.has("book")) {
            if(!!thewords.el.debugger) {
                console.log('get book: ', urlParams.get("book"));
            }
            dataUrl = sourcePath + urlParams.get("book") + '.json';
        }

        console.log(dataUrl);

        //generate base app from dataUrl json
        fetch(dataUrl,  {cache: "no-cache"}).then(response => {
            return response.json();
        }).then(data => {
            if(!!thewords.el.debugger) {
                // console.log(data);
            }

            let titleMarkup = '';
            let contentMarkup = '';


            let backToHomeTitle = "go back";
            let backToHomeUrl = "../";

            let searchForMarkup = '';

            
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
                backToHomeUrl = $(thewords.el.backPathField).length > 0 ? $(thewords.el.backPathField).val() : thewords.el.book.url;
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
                                    chapterVersesMarkup += `<p id="v_${currentValue.chapter}_${currentVerse.verse}"><strong>${currentVerse.verse}</strong> ${currentVerse.text}</p>`;
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
                
                let searchForBookOptionMarkup = `<option value="">Book...</option>`;
                let searchForChapterOptionMarkup = `<option value="">Chapter...</option>`;

                if(!!data.books) {
                    contentMarkup += `<ul class="p-0 d-flex justify-content-center align-items-center flex-wrap flex-col">`;
                    if(data.books.length > 0){
                        data.books.forEach((currentValue, index, arr)=> {
                            let itemtitleMarkup = '';
                            let itemChapterMarkup = '';
                            let itemUrl = '';
                            let linkMarkup = '';
                            let bookAnchor = {
                                title: '',
                                anchor: '',
                                url: ''
                            };

                            if (!!currentValue.title) {
                                itemtitleMarkup = currentValue.title;
                                bookAnchor.title = itemtitleMarkup;
                                bookAnchor.anchor = itemtitleMarkup.replace(/[^a-zA-Z0-9]/g, '');
                            }
                            if (!!currentValue.subtitle) {
                                itemtitleMarkup += " ( " + currentValue.subtitle + " ) ";
                                bookAnchor.title = itemtitleMarkup;
                            }
                            if (!!currentValue.url) {
                                itemUrl = currentValue.url;
                                bookAnchor.url = itemUrl;
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
                            
                            searchForBookOptionMarkup += `<option value="${bookAnchor.url}">${bookAnchor.title}</option>`;

                            contentMarkup += `
                            <li class="m-1">
                                <div class="position-relative" id="book-${bookAnchor.anchor}">
                                    ${linkMarkup}
                                    ${itemChapterMarkup}
                                </div>
                            </li>
                            `;
                        });
                    }
                    contentMarkup += `</ol>`;
                }

                searchForMarkup = `
                    <div class="p-t-1 m-0 d-flex justify-content-center align-items-center flex-wrap">
                        <select class="text-center js-thewordsSearchBook" onchange="thewords.getChaptersFormBook(event, this)">
                            ${searchForBookOptionMarkup}
                        </select>
                        <select class="text-center js-thewordsSearchChapter">
                            ${searchForChapterOptionMarkup}
                        </select>
                        <button type="button" onclick="thewords.jumpToBook(event, this)">Search</button>
                    </div>

                    <div class="p-t-1 m-0 d-flex justify-content-center align-items-center flex-wrap">
                        <div style="position: relative;">
                            <input type="text" placeholder="search..." onkeyup="thewords.autocompleteSearch(event, this)">
                            <div style="z-index: 1;position: absolute;border: 0;left: 0;width: 100%;background: red;">
                                <ul class="js-thewordsAutocompleteSearchList" style="margin: 0;max-height: 330px;overflow: auto;"><ul>
                            </div>
                        </div>
                        <button type="button" onclick="">Search</button>
                    </div>
                `;

            }

            $('#' + appId).find('.js-thewordsTitle').html(titleMarkup);
            $('#' + appId).find('.js-thewordsContent').html(contentMarkup);
            $('#' + appId).find('.js-thewordsSearchWrapper').html(searchForMarkup);
            
            if(urlParams.has("book")) {
                $('#' + appId).find('.js-thewordsHeader').addClass('theword__sticky__header');
            }

            if(urlParams.has("book") && urlParams.has("chapter")) {
                if($('#chapter-'+urlParams.get("chapter")).length > 0) {
                    if(!!thewords.el.debugger) {
                        console.log($('#chapter-'+urlParams.get("chapter")));
                    }
                    if(urlParams.get("chapter") > 1) {
                        thewords.scrollToId('#chapter-'+urlParams.get("chapter"));
                    }
                    
                }
            }
        }).catch(err => {
            console.error('fetchBaseData fail', err);
            // Do something for an error here
        });
    },
    jumpToBook: (e, currentElem)=> {
        let bookUrl = $('.js-thewordsSearchBook').val();
        let ChapterUrl = $('.js-thewordsSearchChapter').val();
        window.location.href = bookUrl+ChapterUrl;
    },
    getChaptersFormBook: (e, currentElem)=>{
        let anchor = $(currentElem).val();

        let sourcePath = thewords.el.book.path;

        if($(thewords.el.sourcePathField).length > 0) {
            sourcePath = $(thewords.el.sourcePathField).val();
        }

        let dataUrl = sourcePath + 'Books.json';
        
        fetch(dataUrl,  {cache: "no-cache"}).then(response => {
            return response.json();
        }).then(data => {

            let findBook = data.books.filter(function(item){
                return item.url == anchor;
            });

            let searchForChapterOptionMarkup = '<option value="">Chapter...</option>';

            if(findBook.length > 0) {

                if(!!thewords.el.debugger) {
                    console.log(findBook[0]);
                }
                
                if (!!findBook[0].totalchapters) {
                    var limit = findBook[0].totalchapters;
                    while (limit > 0) {
                        --limit;
                        let currChapter = findBook[0].totalchapters - limit;
                        let chapUrl = '&chapter=' + currChapter;
                        searchForChapterOptionMarkup += `<option value="${chapUrl}">${ currChapter }</option>`;
                    }
                }
            } else {
                searchForChapterOptionMarkup = `<option value="">No chapter found</option>`;
                console.warn('No chapter found for:' , anchor, findBook);
            }
            
            $('#' + thewords.el.appId).find('.js-thewordsSearchChapter').html(searchForChapterOptionMarkup);

            
        }).catch(err => {
            console.error('fetchBooks fail', err);
            // Do something for an error here
        });


    },
    gotoBook: (e, currentElem)=>{
        let anchor = '#' + $(currentElem).val();
        if($(anchor).length > 0) {
            thewords.scrollToId(anchor);
        }
    },
    scrollToId: (id)=> {
        $('html').animate({
            scrollTop: $(id).offset().top
        }, 1000, "linear", function() {
            setTimeout(() => {
                window.scrollBy(0, -108);
            }, 1050);
        });
    },
    bookParser: (bookname = 'Nombres')=> {
        /**
         * BOOKS READER
         * louis-segond-formatted
         */
         fetch('./louis-segond-formatted.json',  {cache: "no-cache"}).then(response => {
            return response.json();
        }).then(data => {
            if(!!thewords.el.debugger) {
                console.log(data);
                let allBook = [];
                let chaptersVerses = [];

                data.Testaments.forEach(testament => {
                    testament.Books.forEach(bk => {
                        let book = {
                            book:bk.text,
                            chapters:[],
                            testament: testament.text
                        }
                        bk.chapters.forEach((chaps, ind) => {
                            let chapter = {
                                chapter: ind+1,
                                verses: []
                            }

                            chaps.verses.forEach((vers, inx) => {
                                let verse = {
                                    verse: inx + 1,
                                    text: vers.text
                                };
                                chapter.verses.push(verse);
                                
                                let chapterVerse =  `${book.book}-${chapter.chapter}:${verse.verse} || ${verse.text} || ${bk.index}-${chapter.chapter}:${verse.verse}`;
                                chaptersVerses.push(chapterVerse);
                            });

                            book.chapters.push(chapter);

                        });

                        allBook.push(book);
                    });
                });

                console.log(allBook);
                console.log(chaptersVerses);

                var serchText =  new RegExp(thewords.toNormalText('1 Pi-2:24'), 'i');
                var arraycontainsturtles = chaptersVerses.filter(el => thewords.toNormalText(el).match(serchText));
                console.log(arraycontainsturtles);

                
            }
        });
    },
    toNormalText: (str) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    },
    initSearchDB: ()=> {

        let bookJsonUrl = $(thewords.el.bookJsonPathField).length > 0 ? $(thewords.el.bookJsonPathField).val() : thewords.el.book.bookJson;

        fetch(bookJsonUrl,  {cache: "no-cache"}).then(response => {
            return response.json();
        }).then(data => {
            if(!!thewords.el.debugger) {
                console.log(data);
            }

            let chaptersVerses = [];

            data.Testaments.forEach(testament => {
                testament.Books.forEach(bk => {
                    let book = {
                        book:bk.text,
                        index:bk.index,
                        chapters:[],
                        testament: testament.text
                    }
                    bk.chapters.forEach((chaps, ind) => {
                        let chapter = {
                            chapter: ind+1
                        }

                        chaps.verses.forEach((vers, inx) => {
                            let verse = {
                                verse: inx + 1,
                                text: vers.text
                            };
                            
                            let chapterVerse =  `${book.book}-${chapter.chapter}:${verse.verse} || ${verse.text} || ${book.index}-${chapter.chapter}:${verse.verse} , ${book.book} ${chapter.chapter} ${verse.verse} , ${book.index} ${chapter.chapter} ${verse.verse}`;
                            chaptersVerses.push(chapterVerse);
                        });


                    });

                });
            });

            thewords.el.storage.chaptersVerses = chaptersVerses;
            
        });
    },
    searchVerse: (searchText = null, viewMode = 'autocomplete')=> {
            
        var searchResult = thewords.searchTextInArray(searchText, thewords.el.storage.chaptersVerses);
        switch (viewMode) {
            case 'autocomplete':
                thewords.displayAutocompleteSearchResult(searchResult);
            break;
            case 'present':
                let templ = ``;

                templ = `<h1>${searchResult}</h1>`;
                
                $('#' + thewords.el.appId).html(templ);
            break;
        }

    },
    searchTextInArray: (str = null, arrayOfValues = [])=> {
        if(!!str) {
            var searchFor =  new RegExp(thewords.toNormalText(str), 'gmi');
            var filteredArr = arrayOfValues.filter(el => thewords.toNormalText(el).match(searchFor));
            return filteredArr;
        }
        return [];
    },
    autocompleteSearch: (e, currentElem)=> {
        var searchFor = $(currentElem).val();
        if(searchFor.length >= 2) {
            thewords.searchVerse(searchFor);
        }
    },
    displayAutocompleteSearchResult: (data = [])=>{
        var searchResultMarkup = ``;
        console.log(data);
        data.every((result, key) => {
            searchResultMarkup = searchResultMarkup + `<li style="padding: 4px;">${result}</li>`;
            if(key > 10) {
                return false;
            }
            return true
        });
        $('#' + thewords.el.appId).find('.js-thewordsAutocompleteSearchList').html(searchResultMarkup);
    },
    presentVerse: (verse = null) => {
        if (!!verse) {
            let reff = !!verse && verse.length > 0 ? verse : 'Ps-117:1'; 
            let url = window.location.href + '?present&verse=' + reff;
            var popup = window.open(url, "popup", "fullscreen");
            if (popup.outerWidth < screen.availWidth || popup.outerHeight < screen.availHeight)
            {
               popup.moveTo(0,0);
               popup.resizeTo(screen.availWidth, screen.availHeight);
            }
        }
    }
}