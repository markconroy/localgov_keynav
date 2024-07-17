/**
 * @file JS file for the keynav module.
 */

(function keyNavScript(Drupal) {
  Drupal.behaviors.keyNav = {
    attach: function (context) {
      let redirectTimeout;
      let keySequence = ''; // Initialize variable to store key presses
      const sequences = fetch(`${window.location.origin}/modules/localgov_keynav/js/keynav-sequences.json`).then((response) => {
        return response.json();
      });

      const focusableElementsArray = Array.from(document.querySelectorAll('input:not([disabled])', 'textarea:not([disabled])', '[contenteditable]'));
      const ckeditors = document.querySelectorAll('.form-textarea-wrapper');
      const toolbarLinks = document.querySelectorAll('.toolbar-menu-administration > .toolbar-menu > li > a');
      // Define a named event listener function for keyup events.
      function handleKeyup(event) {
        // Add the pressed key to the sequence.
        keySequence += event.key.toLowerCase();

        // Check if the sequence starts with 'lgd'
        if (keySequence.startsWith('lgd')) {
          console.log('Pattern "lgd" detected!');

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
                }, 500); // 500 milliseconds = half a second
              }
            });
          });
          // Foreach item in toolbarlinks, check if the current sequence matches
          // that items index
          toolbarLinks.forEach((link, index) => {
            if (keySequence === `lgdt${(index + 1)}`) {
              window.location.href = link.href;
              keySequence = '';
            }
          });
        } else if (!'lgd'.startsWith(keySequence)) {
          // If the current sequence cannot possibly match 'lgd', reset it
          keySequence = '';
        }

        console.log('Current sequence: ' + keySequence);
      }

      // Add the event listener to the document.
      document.addEventListener('keyup', handleKeyup);

      // Add event listeners to focusable elements to prevent keynav from
      // interfering with typing
      focusableElementsArray.forEach((element) => {
        element.addEventListener('focus', function () {
          console.log('Element focused');
          document.removeEventListener('keyup', handleKeyup);
          keySequence = '';
        });

        // Add event listener to blur event to re-enable keynav
        element.addEventListener('blur', function () {
          console.log('Element blurred');
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
