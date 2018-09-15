/*
* Embed iframe into page and add top banner on page load
*/

(function() {

  var root = document.getElementsByTagName('html')[0];

  var windowTranslated = false; // is window moved down by js
  var transformedElements = []; // efixed elements, transformed by banner
  var donateModuleLoaded  = false;

  window.addEventListener("load", init);

  // Dock donate module banner to top of the page and slide down fixed elements(like top menus)

  function dockBannerToTop() {
      if(!window.doika.bannerDocked && window.doika.banner_visibility) {
      document.body.classList.add("donateHeader__margin");

      window.doika.bannerDocked = true;

      var elems = document.body.getElementsByTagName("*");

      for (var i = 0; i < elems.length; i++) {
          var elementComputedStyle = window.getComputedStyle(elems[i], null);
          var elementPosition = elementComputedStyle.getPropertyValue('position');
          var elementTopPosition = elementComputedStyle.getPropertyValue('top');

          if ((elementPosition == 'fixed') && (parseInt(elementTopPosition) <= 59) && (elementTopPosition)) {
              elems[i].classList.add("donateHeader__transform");
              transformedElements.push(elems[i]);
          }
      }

      var donateHeader = document.createElement('div');

      donateHeader.className = 'donateHeader';

      var title = window.doika.title;     
      var goal = window.doika.result;
      var button = "Дапамагчы";

      donateHeader.innerHTML = '<p class="donateHeader__title">' + title + '</p>' +
        '<p class="donateHeader__goal">' + goal + '</p>' +
        '<p class="donateHeader__button">' + button + '</p>';

      root.appendChild(donateHeader);
      document.getElementsByClassName("donateHeader__button")[0].style.backgroundColor = window.doika.color_banner_help_background;
	  document.getElementsByClassName("donateHeader__button")[0].style.color = window.doika.color_banner_help_text;
	  
      donateHeader.style.backgroundColor = window.doika.color_banner_background;
	  donateHeader.style.color = window.doika.color_banner_help_text;
	 
      var moduleDOMElement = document.querySelector("#module-donate-wrapper");
      var banner = document.querySelector(".donateHeader");
      checkDonateModuleVisibility(moduleDOMElement, banner);

    }
  }

  function scrollToDonateWindow(moduleDOMElement) {
    moduleDOMElement && moduleDOMElement.scrollIntoView({
      behavior: 'smooth'
    });
  }

  // check if module div inside viewport
  function checkDonateModuleVisibility(moduleDOMElement, banner) {
	  if(window.doika.banner_visibility) {
		  var rect = moduleDOMElement.getBoundingClientRect();
		  var delta = 0;
		  if(window.doika.bannerDocked) {
			var delta = 60;
		  }

		  if( (rect.bottom - delta) > 0 &&
			  rect.right > 0 &&
			  rect.left < (window.innerWidth || document.documentElement.clientWidth) &&
			  (rect.top + delta) < (window.innerHeight || document.documentElement.clientHeight)
		  ){

			banner.style.display = "none";
			document.body.classList.remove("donateHeader__margin");
			window.doika.bannerDocked = false;

			for (var i in transformedElements) {
			   transformedElements[i].classList.remove("donateHeader__transform");
			}
		  }
		  else {
			banner.style.display = "flex";

			for (var i in transformedElements) {
			   transformedElements[i].classList.add("donateHeader__transform");
			}

			document.body.classList.add("donateHeader__margin");
			window.doika.bannerDocked = true;
		  }
	  }
  }

  function PopUpShow(popup) {
    popup.style.display = "block";
    document.body.style.overflow = "hidden";
  }

  function PopUpHide(popup) {
    popup.style.display = "none";
    document.body.style.overflow = "auto";
  }

  function init() {

    loadDonateModule();
    loadPopUpToDOM();

    var moduleDOMElement = document.querySelector("#module-donate");
    
    window.addEventListener("beforeunload", function(e) {
      var top  = window.pageYOffset || document.documentElement.scrollTop;
      sessionStorage.setItem('doikaPosition', top);
      return null;
    });
  }

  function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
  };

  function loadDonateModule() {
    var wrapper = document.getElementById("module-donate-wrapper")
    
    window.doika = {};
    window.doika.campaignId = wrapper.getAttribute("data-id");
  
    switch (getUrlParameter("message")) {
      case '1':
       window.doika.status = "success";
       wrapper.innerHTML = '<iframe id="module-donate" src="/client-side/module-donate-payment.html" frameborder="0" scrolling=no height="0" width="100%"></iframe>';
      break;
      case '2':
        window.doika.status = "decline";
        wrapper.innerHTML = '<iframe id="module-donate" src="/client-side/module-donate-payment.html" frameborder="0" scrolling=no height="0" width="100%"></iframe>';
      break;
      case '3':
        window.doika.status = "fail";
        wrapper.innerHTML = '<iframe id="module-donate" src="/client-side/module-donate-payment.html" frameborder="0" scrolling=no height="0" width="100%"></iframe>';
      break;
      default:
        wrapper.innerHTML = '<iframe id="module-donate" src="/client-side/module-donate-main.html" frameborder="0" scrolling=no height="0" width="100%"></iframe>';
   }

    if (typeof window.addEventListener != 'undefined') {
        window.addEventListener('message', function(e) {
          var donateModule = document.getElementById('module-donate');
    
          switch (e.data[0]) {
            case 'scrollToPayForm':
                scrollToDonateWindow(wrapper);
                break;
            case 'updateIframeHeight':
                if (donateModule) {
                  var heightStyle = donateModule.contentWindow.document.body.scrollHeight + 'px';
                  donateModule.style.height = heightStyle;
                  wrapper.style.height = heightStyle;
                }
              break;
            case 'doikaSubmit':
                wrapper.innerHTML = '<iframe id="module-donate" src="/client-side/module-donate-payment.html" frameborder="0" scrolling=no height="0" width="100%"></iframe>';
                window.doikaSum = e.data[1];
              break;
            case 'doikaMain':
                wrapper.innerHTML = '<iframe id="module-donate" src="/client-side/module-donate-main.html" frameborder="0" scrolling=no height="0" width="100%"></iframe>';
                window.doikaSum = 0;
              break;
            case 'dockHeader':
              if(!document.querySelector(".donateHeader") && window.doika.banner_visibility) {
                dockBannerToTop();
                 var banner = document.querySelector(".donateHeader");

                 document.querySelector(".donateHeader__button").addEventListener("click", function () {
                   scrollToDonateWindow(wrapper);
                 });

                 window.addEventListener("scroll", function () {
                   checkDonateModuleVisibility(wrapper , banner);
                 });

                 window.addEventListener("resize", function () {
                   checkDonateModuleVisibility(wrapper, banner);
                 });
               }
            break;
          }

        }, false);
    }



    window.addEventListener("resize", function(e) {
      var donateModule = document.getElementById('module-donate');
      donateModule.style.height = donateModule.contentWindow.document.body.scrollHeight + 'px';
      wrapper.style.height = donateModule.contentWindow.document.body.scrollHeight + 'px';
    });

    loadjscssfile('/client-side/assets/css/banner.css','css');
    loadjscssfile('/client-side/assets/css/targetDonatePage.css','css');
    loadjscssfile('https://js.bepaid.by/begateway-1-latest.min.js','js');

    donateModuleLoaded  = true;
  }

  function AJAXRequest(url, callback) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);

    request.onreadystatechange = function() {
      if (request.readyState === 4) {
        if (request.status >= 200 && request.status < 300) {
          return callback(request.responseText);
        }
      }
    };
    request.send();
  }

  function loadPopUpToDOM(html) {
    AJAXRequest('/client-side/contract.html', addPopUpToDOM);
  }
  
  function addPopUpToDOM(html) {
      var popup = document.createElement('div');
      popup.className = "b-popup";
      popup.id = "doikaPopup";
      popup.innerHTML = '<div class="b-popup-content">' +
        '<div class="b-popup-close"></div>' +
        html +
        '</div>';
      document.body.appendChild(popup);

      document.querySelector(".b-popup-close").addEventListener("click", function () {
        PopUpHide(popup);
      });

      popup.addEventListener("click", function () {
        PopUpHide(popup);
      });

      document.querySelector(".b-popup-content").addEventListener("click", function(e){
        e.stopPropagation();
      });

      if (typeof window.addEventListener != 'undefined') {
        window.addEventListener('message', function(e) {
          if((e.data[1] == true) && (e.data[0] == 'openPopUp')) {
             PopUpShow(popup);
          }
        }, false);
      }
  }

  //insert scripts into DOM
  function loadjscssfile(filename, filetype) {
    if (filetype == "js") {

      var fileref = document.createElement('script')
      fileref.setAttribute("type", "text/javascript")
      fileref.setAttribute("src", filename)

    } else if (filetype == "css") {
      var fileref = document.createElement("link")
      fileref.setAttribute("rel", "stylesheet")
      fileref.setAttribute("type", "text/css")
      fileref.setAttribute("href", filename)
    }
    if (typeof fileref != "undefined")
      document.body.appendChild(fileref)
  }

}());
