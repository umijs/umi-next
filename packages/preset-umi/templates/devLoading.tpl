<!DOCTYPE html>
<html>
  <head>
    <title>{{ messages.loading }} | {{ messages.appName }}</title>
    <meta charset="utf-8"/>
    <meta content="width=device-width,initial-scale=1.0,minimum-scale=1.0" name="viewport" />
    <style>
      .spotlight {
        filter: blur(20vh);
        height: 50vh;
      }
      .spotlight-top {
        background: repeating-linear-gradient(to right, #1191ff 0%, #34CDFE 50%, #00DC82 100%);
        top: -40vh;
      }
      .spotlight-bottom {
        background: repeating-linear-gradient(to right, #00DC82 0%, #34CDFE 50%, #1191ff 100%);
        bottom: -40vh;
      }
      .spotlight-wrapper {
        opacity: 0.5;
        transition: opacity 0.4s ease-in;
      }

      .umi-logo {
        margin-bottom: 18px;
        font-size: 2rem;
        font-weight: 500;
        line-height: 1.75rem;
        display: flex;
        align-items: center;
        color: #000;
        text-decoration: none;
        font-family: ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";
      }

      .umi-logo img {
        width: 2.5rem;
        height: 2.5rem;
        padding-right: 8px;
      }

      .umi-logo:hover ~ .spotlight-wrapper {
        opacity: 1;
      }
      .umi-loader-bar {
        background: repeating-linear-gradient(to right, #1191ff 0%, #34CDFE 25%, #00DC82 50%, #36E4DA 75%, #1191ff 100%);
        width: 100%;
        background-size: 200% auto;
        background-position: 0 0;
        animation: gradient 2s infinite;
        animation-fill-mode: forwards;
        animation-timing-function: linear;
      }
      @keyframes gradient {
        0% {
          background-position: 0 0;
        }
        100% {
          background-position: -200% 0;
        }
      }

      .bg-white {
        --tw-bg-opacity: 1;
        background-color: rgba(255, 255, 255, var(--tw-bg-opacity));
      }
      .dark .dark\:bg-black {
        --tw-bg-opacity: 1;
        background-color: rgba(0, 0, 0, var(--tw-bg-opacity));
      }
      .inline {
        display: inline;
      }
      .flex {
        display: -webkit-box;
        display: -ms-flexbox;
        display: -webkit-flex;
        display: flex;
      }
      .flex-col {
        -webkit-box-orient: vertical;
        -webkit-box-direction: normal;
        -ms-flex-direction: column;
        -webkit-flex-direction: column;
        flex-direction: column;
      }
      .items-center {
        -webkit-box-align: center;
        -ms-flex-align: center;
        -webkit-align-items: center;
        align-items: center;
      }
      .justify-center {
        -webkit-box-pack: center;
        -ms-flex-pack: center;
        -webkit-justify-content: center;
        justify-content: center;
      }
      .h-16 {
        height: 4rem;
      }
      .h-\[3px\] {
        height: 3px;
      }
      .mb-4 {
        margin-bottom: 1rem;
      }
      .min-h-screen {
        min-height: 100vh;
      }
      .fixed {
        position: fixed;
      }
      .left-0 {
        left: 0px;
      }
      .right-0 {
        right: 0px;
      }
      .text-center {
        text-align: center;
      }
      .text-black {
        --tw-text-opacity: 1;
        color: rgba(0, 0, 0, var(--tw-text-opacity));
      }
      .dark .dark\:text-white {
        --tw-text-opacity: 1;
        color: rgba(255, 255, 255, var(--tw-text-opacity));
      }
      .w-40 {
        width: 10rem;
      }
      .w-full {
        width: 100%;
      }
      .z-20 {
        z-index: 20;
      }
      .z-10 {
        z-index: 10;
      }
    </style>
  </head>
  <body class="min-h-screen bg-white dark:bg-black flex flex-col justify-center items-center text-center">
    <a href="https://next.umijs.org/" target="_blank" rel="noopener" class="umi-logo z-20">
      <img  src="data:image/png;base64,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" />UmiJs
    </a>
    <div class="spotlight-wrapper">
      <div class="fixed left-0 right-0 spotlight spotlight-top z-10"></div>
    </div>
    <div class="spotlight-wrapper">
      <div class="fixed left-0 right-0 spotlight spotlight-bottom z-q0"></div>
    </div>
    <div class="umi-loader-bar h-[3px] w-full inline"/>
    <script>
      if (typeof window.fetch === 'undefined') {
        setTimeout(() => window.location.reload(), 1000)
      } else {
        const check = async () => {
          try {
            const body = await window
              .fetch(window.location.href)
              .then(r => r.text())
            if (body.includes('_____UMI_DEV__DONE___')) {
              return window
                .location
                .reload()
            }
          } catch  {}
          setTimeout(check, 1000)
        }
        check()
      }
    </script>
  </body>
</html>
