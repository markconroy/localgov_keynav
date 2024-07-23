/**
 * @file JS file for the keynav module.
 */

(function keyNavScript(Drupal) {
  Drupal.behaviors.keyNav = {
    attach: function (context) {
      let redirectTimeout;
      let keySequence = ''; // Initialize variable to store key presses
      const sequences = fetch(`${window.location.origin}/modules/contrib/localgov_keynav/js/keynav-sequences.json`).then((response) => {
        return response.json();
      });

      const focusableElementsArray = Array.from(document.querySelectorAll('input:not([disabled])', 'textarea:not([disabled])', '[contenteditable]'));
      const ckeditors = document.querySelectorAll('.form-textarea-wrapper');
      const toolbarLinks = document.querySelectorAll('.toolbar-menu-administration > .toolbar-menu > li > a');

      function handleTimeout(link) {
        clearTimeout(redirectTimeout);
        redirectTimeout = setTimeout(() => {
          // window.location.href = link.href;
          console.log(link.href);
          keySequence = '';
        }, 750);
      }

      // Define a named event listener function for keyup events.
      function handleKeyup(event) {
        // Add the pressed key to the sequence.
        keySequence += event.key.toLowerCase();

        // Check if the sequence starts with 'lgd'
        if (keySequence.startsWith('lgd')) {

          // For each sequence in the JSON file, check if the current sequence matches
          sequences.then((data) => {
            data.forEach((sequence) => {
              if (keySequence === 'lgd' + sequence.keynavSequence) {
                // Clear any existing timeout to reset the delay if another key is pressed
                clearTimeout(redirectTimeout);
                // Set a new timeout to redirect after a half-second delay
                redirectTimeout = setTimeout(() => {
                  window.location.href = sequence.url;
                  keySequence = ''; // Reset the key sequence after redirecting
                }, 750);
              }
            });
          });
          // Foreach item in toolbarlinks, check if the current sequence matches
          // that items index
          toolbarLinks.forEach((topLevelItem, topLevelItemIndex) => {
            if (keySequence === `lgdt${(topLevelItemIndex + 1)}`) {
              handleTimeout(topLevelItem);
            }
            const hasLevel1Items = topLevelItem.closest('li').querySelector('.toolbar-menu');
            if (hasLevel1Items) {
              const toolbarLinksLevel1ItemsLi = Array.from(hasLevel1Items.children);
              const toolbarLinksLevel1Items = [];
              toolbarLinksLevel1ItemsLi.forEach((li) => {
                toolbarLinksLevel1Items.push(li.querySelector('a'));
              });
              toolbarLinksLevel1Items.forEach((levelOneItem, levelOneItemIndex) => {
                if (keySequence === `lgdt${(topLevelItemIndex + 1)}.${(levelOneItemIndex)}`) {
                  handleTimeout(levelOneItem);
                }
                // const toolbarLinksLevel2Items = levelOneItem.closest('li > ul').querySelectorAll('li > a');

                // toolbarLinksLevel2Items.forEach((levelTwoItem, levelTwoItemIndex) => {
                //   if (keySequence === `lgdt${(topLevelItemIndex + 1)}.${(levelOneItemIndex)}.${(levelTwoItemIndex)}`) {
                //     console.log(keySequence);
                //     handleTimeout(levelTwoItem);
                //   }
                // });
              });
            }
          });
        } else if (!'lgd'.startsWith(keySequence)) {
          // If the current sequence cannot possibly match 'lgd', reset it
          keySequence = '';
        }

      }

      // Add the event listener to the document.
      document.addEventListener('keyup', handleKeyup);

      // Add event listeners to focusable elements to prevent keynav from
      // interfering with typing
      focusableElementsArray.forEach((element) => {
        element.addEventListener('focus', function () {
          document.removeEventListener('keyup', handleKeyup);
          keySequence = '';
        });

        // Add event listener to blur event to re-enable keynav
        element.addEventListener('blur', function () {
          document.addEventListener('keyup', handleKeyup);
          keySequence = '';
        });
      });

      // Add event listeners to CKEditor instances to prevent keynav from
      // interfering with typing
      ckeditors.forEach((element) => {
        element.addEventListener('click', function () {
          document.removeEventListener('keyup', handleKeyup);
          keySequence = '';
        });

        // Add event listener to "blur" event to re-enable keynav
        window.addEventListener('click', function (e) {
          if (!(e.target.closest('.form-textarea-wrapper'))) {
            document.addEventListener('keyup', handleKeyup);
            keySequence = '';
          }
        });
      });

    },
  };
})(Drupal);
