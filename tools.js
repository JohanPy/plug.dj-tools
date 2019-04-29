var plugDJToolsExtensionUninstall = (function() {
let resCancel = "Cancel";

let resClearPlaylist = "Clear playlist";
let resClearName = (name) => `Clear ${name}?`;
let resTypeCodeToClear = (code) => `Type ${code} To Clear`;
let resTypeCode = (code) => `Type ${code}`;

let resDeleteMedia = "Delete media";
let resDeleteItems = (count) => `Delete ${count} items from your playlist?`;
let resDeleteItem = (author, title) => `Delete ${author} - ${title} from your playlist?`;

let resGearPlaylist = "Generate playlist"
let resGearName = (name) => `Generate ${name}?`;
let resTypeTracksCountToGenerate = (total) => `Type the number of tracks to generate / ${total}`;
let resTypeTracksCount = "#tracks";

let resSortPlaylist = "Sort active playlist";
let resSortName = (name) => `Are you sure you want to sort ${name}?`;

let resMaxByArtist = "Max title by artist (empty = not limited)";
let resTypeMaxByArtist = "#max artist";

let resBeginning = "Add on top";
let resEnd = "Append";
let resOverwrite = "Overwrite playlist";

let resOld = "Old";

let resLogoTitles  = ["None", "Japan", "Other", "Video game", "Indies", "Fiction", "Idols", "J-Music", "Retro Gaming", "Christmas", "Roleplay"];

const logoTags =     ["NLN",        "NLJ",      "NLO",       "NLVG",         "NLIN",      "NLF",       "NLID",      "NLJM",      "NLRG",         "NLC",       "NLRP"];

const version = "1.3.6";
const logoEdges    = ["#55555566", "#FF6E6E66", "#AAAAAA66", "#96C2D066",    "#FBE17066", "#C7A8CA66", "#FDBFFB66", "#FF6E6E66", "#A6C19E66",    "#A6C19E66", "#96C2D066"];
const logoLetters  = ["#AAAAAAE6", "#FFFFFFE6", "#FFFFFFE6", "#498BC3E6",    "#F2C10CE6", "#946BA8E6", "#FA92F9E6", "#F20A0EE6", "#698F5CE6",    "#F20A0EE6", "#FFFFFFE6"];
const logoOldN     = [undefined,   undefined,   "#E8E8E8",   "#7BB5DD",      "#E5D3A3",   "#C1B3C0",   "#E8D3DC",   "#E48889",   "#8ACB87",      undefined,   undefined];
const logoOldOLIFE = [undefined,   undefined,   "#919B93",   "#1B84B4",      "#D59C31",   "#8B629C",   "#E59CBA",   "#A0191D",   "#4C7451",      undefined,   undefined];

const maxPlaylist = 200;
const nolifeTv = "nolife-tv";

const tsvColumnSeparator = "\t";
const tsvRowTerminator = "\r\n";
const tsvExportColumnsAdvanced = ["pl-name", "pl-id", "cid", "id", "author", "title", "duration", "format", "image"];
const tsvExportColumnsNormal = ["pl-name", "cid", "author", "title", "duration", "format", "image"];

const tsvTypeExportNormal = "normal";
const tsvTypeExportAdvanced = "advanced";

let tsvExportColumns;
let tsvImportNeedColumns;
let tsvImportColumns;
let tsvFileName;
let tsvTypeExport;

let observerMediaPanel;
let observerPlaylistMenu;
let observerApp;
let observerDialogContainer;

let logoIndex = 0;
let previousLogoIndex = logoIndex;
let tempLogoIndex = undefined;
let logoChanged = false;
let logoTimer;
let skipAtTimer;
let skipAtTime;
let skipAtId;
let skipAtLeave;
let clipBoard = { id: null, cut: false, medias: []};

let busyMediasCheckboxes = false;
let scale = "";

let panelNolifeAuthor = "";
let panelNolifeTitle = "";
let panelNolifeTop = false;
let panelNolifeRight;
let panelNolifeDelay = 0;

function language_fr()
{
  resCancel = "Annuler";

  resClearPlaylist = "Effacer";
  resClearName = (name) => `Effacer ${name} ?`;
  resTypeCodeToClear = (code) => `Tapez ${code} pour effacer`;
  resTypeCode = (code) => `Tapez ${code}`;

  resDeleteMedia = "Supprimer cet élément";
  resDeleteItems = (count) => `Supprimer ${count} élements de votre liste de lecture ?`;
  resDeleteItem = (author, title) => `Supprimer ${author} - ${title} de votre liste ?`;

  resGearPlaylist = "Générer"
  resGearName = (name) => `Générer ${name} ?`;
  resTypeTracksCountToGenerate = (total) => `Tapez le nombre de pistes à générer / ${total}`;
  resTypeTracksCount = "Nb pistes";

  resSortPlaylist = "Trier liste active"
  resSortName = (name) => `Êtes vous sûr(e) de vouloir trier ${name} ?`;

  resMaxByArtist = "Max titre par artiste (vide = non limité)";
  resTypeMaxByArtist = "Max artiste";

  resBeginning = "Ajouter au début";
  resEnd = "Ajouter à la fin";
  resOverwrite = "Ecraser la liste";

  resOld = "Ancien";

  resLogoTitles  = ["Aucun", "Japon", "Autre", "Jeu vidéo", "Indies", "Fiction", "Idols", "J-Music", "Rétro Gaming", "Noël", "Jeu de rôle"];
}

function createAll()
{
  const language = API.getUser().language;
  if (language == "fr")
  {
    language_fr();
  }
  createCSS();
  createPlaylistsButtons();
  createPlaylistButtons();
  createPlaylistsCheckboxes();
  createMediasCheckboxes();
  createUserLogoBouncer();
  createObservers();
  if (logoIndex > 0) logoNolifeTimerEvent();
  API.on(API.ADVANCE, advance);
  enterRoom(document.getElementById("app").getAttribute("data-theme"));
}

function createCSS()
{
  if ($("#tools-extension-css").length == 0)
  {
    const style = $('<style id="plugdj-tools-extension-css">.community .community__playing-top { background-color: unset; } .unselectable { pointer-events: none; -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; } @keyframes unfade {from { opacity: 0.0; } to { opacity: 0.9; }} #panel-nolife { text-align: right; position: absolute; z-index: 10; width: 4000px; height: 60px; opacity: 0.9;} .title-nolife { display: inline; color: black; font-size: 32px; font-family: calibri; font-style: italic; font-weight: bold; text-shadow: 2px 2px #AAA, 1px 1px #AAA; position: absolute; top: 0; right: 0; height: 34px; filter: blur(1px); } .author-nolife, .author-front-nolife { display: inline; font-size: 26px; font-family: tahoma; font-weight: bold; letter-spacing: 0.25px; position: absolute; right: 0; bottom: 0; height: 26px; filter: blur(1px); } .author-nolife { color: black; -webkit-text-stroke: 5px black; } .author-front-nolife { color: white; -webkit-text-stroke: 1px black; } @keyframes fade {from { fill: #EEEEEE; } to { fill: transparent; }} #fullscreen-layer #yt-watermark svg { fill: transparent; animation-name: none; } #fullscreen-layer:hover #yt-watermark svg { fill: #EEEEEE; animation-fill-mode: forwards; animation-name: fade; animation-delay: 4s; animation-duration: 1s; } #fullscreen-layer #yt-watermark:hover svg { fill: #FFFFFF; animation-name: none; } #media-panel .row .item { position: relative; height: 55px; width: 30px; margin-right: 0px; cursor: pointer; } #media-panel .row .item.selected i { display: block; } #media-panel .row .item i { top: 17px; left: 5px; display: none; } #playlist-menu .container .item { position: relative; height: 48px; width: 30px; margin-right: 0px; cursor: pointer; } #playlist-menu .container .item.selected i { display: block; } #playlist-menu .container .item i { top: 17px; left: 5px; display: none; } #playlist-panel.playlist--override #playlist-menu .container .row { padding: 0 0 0 0; } #dialog-container #dialog-playlist-delete .dropdown.open #up { display: block; } #dialog-container #dialog-playlist-delete .dropdown #up { display: none; padding: 6px 10px; } #dialog-container #dialog-playlist-delete .dropdown.open #down { display: none; } #dialog-container #dialog-playlist-delete .dropdown #down { display: block; padding: 6px 10px; } @media (min-width: 1344px) and (min-height: 850px) { .community .community__playing-top { min-width: 824px; min-height: 464px; }} .playlist-buttons-content { flex-wrap: wrap; max-height: 50px; } .playlist-buttons-content .playlist-buttons-import-create, .playlist-buttons-content .playlist-buttons-import-export-tsv { margin-top: 4px; } .playlist-buttons-content .playlist-buttons-import-export-tsv { flex-grow: 1; display: flex; padding-right: 20px; justify-content: center; align-items: center; margin-top: 8px; } .playlist-buttons-content #playlist-import-tsv.button, .playlist-buttons-content #playlist-export-tsv.button { position: relative; bottom: auto; height: auto; width: 46%; margin: 0 2%; max-width: 120px; text-transform: uppercase; text-align: center; cursor: pointer; font-size: 12px; padding: 6px 15px; background: 0 0; border: 1px solid #fff; border-radius: 20px; display: flex; justify-content: center; align-items: center; opacity: .6; transition: all .3s; }  #playlist-import-tsv { left: 0; z-index: 50; background: #323742; } #playlist-export-tsv { right: 0; z-index: 55; background: #444a59; } .playlist-buttons-content #playlist-export-tsv.button:hover, .playlist-buttons-content #playlist-import-tsv.button:hover { opacity: 1; transition: all .3s; } .playlist-buttons-content #playlist-export-tsv.button i, .playlist-buttons-content #playlist-import-tsv.button i { top: auto; margin: 0 5px 0 0; font-size: 14px; } .playlist-buttons-content #playlist-create-tsv.button span, .playlist-buttons-content #playlist-import-tsv.button span { margin: 0; top: 0; } @media (min-width: 768px) { .playlist-buttons-content .playlist-buttons-import-export-tsv { padding-right: 0; }}</style>');
    $('html > head').append(style);
  }
}

function createFullscreenLayer()
{
  if ($("#fullscreen-layer").length == 0)
  {
    const fullscreenLayer = $('<div id="fullscreen-layer" style="position: absolute; z-index: 10; cursor: pointer; left: 0; top: 0; width: 100%; height: 100%;"><iframe class="unselectable" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%;" id="yt-resize-frame"></iframe></div>');
    fullscreenLayer.dblclick(function(event)
    {
      if (document.fullscreenElement)
      {
        document.exitFullscreen();
      }
      else
      {
        $(this).parent().get(0).requestFullscreen();
      }
    }).mousemove(function(event)
    {
      $(this).css("cursor", "pointer");
      
      let svg = $(this).find("svg");
      let newSvg = svg.clone();
      newSvg.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(event)
      {
        $("#fullscreen-layer").css("cursor", "none");
      });
      svg.before(newSvg);
      svg.remove();
    });
    const ytWatermark = $('<a id="yt-watermark" style="position: absolute; z-index: 10; right: 0; top: calc(100% - 58px); width: 142px; height: 58px" target="_blank" aria-label="Regarder sur www.youtube.com" href=""><svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" height="26" version="1.1" viewBox="0 0 110 26" width="110" style="pointer-events: none; position: absolute; top: 16px; left: 16px;"><path d="M 16.68,.99 C 13.55,1.03 7.02,1.16 4.99,1.68 c -1.49,.4 -2.59,1.6 -2.99,3 -0.69,2.7 -0.68,8.31 -0.68,8.31 0,0 -0.01,5.61 .68,8.31 .39,1.5 1.59,2.6 2.99,3 2.69,.7 13.40,.68 13.40,.68 0,0 10.70,.01 13.40,-0.68 1.5,-0.4 2.59,-1.6 2.99,-3 .69,-2.7 .68,-8.31 .68,-8.31 0,0 .11,-5.61 -0.68,-8.31 -0.4,-1.5 -1.59,-2.6 -2.99,-3 C 29.11,.98 18.40,.99 18.40,.99 c 0,0 -0.67,-0.01 -1.71,0 z m 72.21,.90 0,21.28 2.78,0 .31,-1.37 .09,0 c .3,.5 .71,.88 1.21,1.18 .5,.3 1.08,.40 1.68,.40 1.1,0 1.99,-0.49 2.49,-1.59 .5,-1.1 .81,-2.70 .81,-4.90 l 0,-2.40 c 0,-1.6 -0.11,-2.90 -0.31,-3.90 -0.2,-0.89 -0.5,-1.59 -1,-2.09 -0.5,-0.4 -1.10,-0.59 -1.90,-0.59 -0.59,0 -1.18,.19 -1.68,.49 -0.49,.3 -1.01,.80 -1.21,1.40 l 0,-7.90 -3.28,0 z m -49.99,.78 3.90,13.90 .18,6.71 3.31,0 0,-6.71 3.87,-13.90 -3.37,0 -1.40,6.31 c -0.4,1.89 -0.71,3.19 -0.81,3.99 l -0.09,0 c -0.2,-1.1 -0.51,-2.4 -0.81,-3.99 l -1.37,-6.31 -3.40,0 z m 29.59,0 0,2.71 3.40,0 0,17.90 3.28,0 0,-17.90 3.40,0 c 0,0 .00,-2.71 -0.09,-2.71 l -9.99,0 z m -53.49,5.12 8.90,5.18 -8.90,5.09 0,-10.28 z m 89.40,.09 c -1.7,0 -2.89,.59 -3.59,1.59 -0.69,.99 -0.99,2.60 -0.99,4.90 l 0,2.59 c 0,2.2 .30,3.90 .99,4.90 .7,1.1 1.8,1.59 3.5,1.59 1.4,0 2.38,-0.3 3.18,-1 .7,-0.7 1.09,-1.69 1.09,-3.09 l 0,-0.5 -2.90,-0.21 c 0,1 -0.08,1.6 -0.28,2 -0.1,.4 -0.5,.62 -1,.62 -0.3,0 -0.61,-0.11 -0.81,-0.31 -0.2,-0.3 -0.30,-0.59 -0.40,-1.09 -0.1,-0.5 -0.09,-1.21 -0.09,-2.21 l 0,-0.78 5.71,-0.09 0,-2.62 c 0,-1.6 -0.10,-2.78 -0.40,-3.68 -0.2,-0.89 -0.71,-1.59 -1.31,-1.99 -0.7,-0.4 -1.48,-0.59 -2.68,-0.59 z m -50.49,.09 c -1.09,0 -2.01,.18 -2.71,.68 -0.7,.4 -1.2,1.12 -1.49,2.12 -0.3,1 -0.5,2.27 -0.5,3.87 l 0,2.21 c 0,1.5 .10,2.78 .40,3.78 .2,.9 .70,1.62 1.40,2.12 .69,.5 1.71,.68 2.81,.78 1.19,0 2.08,-0.28 2.78,-0.68 .69,-0.4 1.09,-1.09 1.49,-2.09 .39,-1 .49,-2.30 .49,-3.90 l 0,-2.21 c 0,-1.6 -0.2,-2.87 -0.49,-3.87 -0.3,-0.89 -0.8,-1.62 -1.49,-2.12 -0.7,-0.5 -1.58,-0.68 -2.68,-0.68 z m 12.18,.09 0,11.90 c -0.1,.3 -0.29,.48 -0.59,.68 -0.2,.2 -0.51,.31 -0.81,.31 -0.3,0 -0.58,-0.10 -0.68,-0.40 -0.1,-0.3 -0.18,-0.70 -0.18,-1.40 l 0,-10.99 -3.40,0 0,11.21 c 0,1.4 .18,2.39 .68,3.09 .49,.7 1.21,1 2.21,1 1.4,0 2.48,-0.69 3.18,-2.09 l .09,0 .31,1.78 2.59,0 0,-14.99 c 0,0 -3.40,.00 -3.40,-0.09 z m 17.31,0 0,11.90 c -0.1,.3 -0.29,.48 -0.59,.68 -0.2,.2 -0.51,.31 -0.81,.31 -0.3,0 -0.58,-0.10 -0.68,-0.40 -0.1,-0.3 -0.21,-0.70 -0.21,-1.40 l 0,-10.99 -3.40,0 0,11.21 c 0,1.4 .21,2.39 .71,3.09 .5,.7 1.18,1 2.18,1 1.39,0 2.51,-0.69 3.21,-2.09 l .09,0 .28,1.78 2.62,0 0,-14.99 c 0,0 -3.40,.00 -3.40,-0.09 z m 20.90,2.09 c .4,0 .58,.11 .78,.31 .2,.3 .30,.59 .40,1.09 .1,.5 .09,1.21 .09,2.21 l 0,1.09 -2.5,0 0,-1.09 c 0,-1 -0.00,-1.71 .09,-2.21 0,-0.4 .11,-0.8 .31,-1 .2,-0.3 .51,-0.40 .81,-0.40 z m -50.49,.12 c .5,0 .8,.18 1,.68 .19,.5 .28,1.30 .28,2.40 l 0,4.68 c 0,1.1 -0.08,1.90 -0.28,2.40 -0.2,.5 -0.5,.68 -1,.68 -0.5,0 -0.79,-0.18 -0.99,-0.68 -0.2,-0.5 -0.31,-1.30 -0.31,-2.40 l 0,-4.68 c 0,-1.1 .11,-1.90 .31,-2.40 .2,-0.5 .49,-0.68 .99,-0.68 z m 39.68,.09 c .3,0 .61,.10 .81,.40 .2,.3 .27,.67 .37,1.37 .1,.6 .12,1.51 .12,2.71 l .09,1.90 c 0,1.1 .00,1.99 -0.09,2.59 -0.1,.6 -0.19,1.08 -0.49,1.28 -0.2,.3 -0.50,.40 -0.90,.40 -0.3,0 -0.51,-0.08 -0.81,-0.18 -0.2,-0.1 -0.39,-0.29 -0.59,-0.59 l 0,-8.5 c .1,-0.4 .29,-0.7 .59,-1 .3,-0.3 .60,-0.40 .90,-0.40 z"></path></svg></a>');
    ytWatermark.click(function()
    {
      const media = API.getMedia();
      if (media)
      {
        $(this).attr("href", `https://www.youtube.com/watch?time_continue=${API.getTimeElapsed()}&v=${media.cid}`);
      }
    }).mouseover(function()
    {
      const media = API.getMedia();
      if (media)
      {
        $(this).attr("href", `https://www.youtube.com/watch?v=${media.cid}`);
      }
    });
    $('#yt-frame').before(fullscreenLayer.append(ytWatermark));
    $(".community__playing-controls").css("pointer-events", "none");
    $(".community__playing-top-buttons").css("pointer-events", "auto");
    document.getElementById('yt-resize-frame').contentWindow.addEventListener('resize', function()
    {
      rescale();
      logoNolifeTimerEvent();
      panelNolifeUpdate();
    });
  }
}

function createObserver(element, config, callback)
{
  let observer = new MutationObserver(callback);
  observer.observe(element, config);
  return observer;
}

function install()
{
  console.log(`plug.dj tools v${version}`);
  let playlistMenu = false, mediaPanel = false, userProfile = false, app = false, communitySongPlaying = false, playlistButtonsContent = false, ytFrame = false, dialogContainer = false;
  
  function checkAll()
  {
    playlistMenu = playlistMenu || (document.getElementById("playlist-menu") != null);
    mediaPanel = mediaPanel || (document.getElementById("media-panel") != null);
    userProfile = userProfile || (document.getElementsByClassName("user-profile").length > 0);
    app = app || (document.getElementById("app") != null);
    communitySongPlaying = communitySongPlaying || (document.getElementsByClassName("community__song-playing").length > 0);
    playlistButtonsContent = playlistButtonsContent || (document.getElementsByClassName("playlist-buttons-content").length > 0);
    dialogContainer = dialogContainer || (document.getElementById("dialog-container") != null);
    return playlistMenu && mediaPanel && userProfile && app && playlistButtonsContent && communitySongPlaying && dialogContainer;
  }

  function checkFsl()
  {
    ytFrame = ytFrame || (document.getElementById("yt-frame") != null);
    return ytFrame;
  }

  let all = checkAll();
  let fsl = checkFsl();

  if (all)
  {
    createAll();
  }
  if (fsl)
  {
    createFullscreenLayer();
  }

  if (!all || !fsl)
  {
    let observer = createObserver(document.body, { attributes: false, childList: true, subtree: true }, function(mutationsList, observer)
    {
      if (!all)
      {
        all = checkAll();
        if (all)
        {
          createAll();
        }
      }
      if (!fsl)
      {
        fsl = checkFsl();
        if (fsl)
        {
          createFullscreenLayer();
        }
      }
      if (all && fsl)
      {
        observer.disconnect();
      }
    });
  }
}

function createPlaylistButtons()
{
  createGearButton();
  createClearButton();
  createSortButton();
  createRefreshButton();
  createCutCopyPasteButton();
}

function formatDate(date)
{
  let format = "" + (date.getFullYear() * 10000000000 + (date.getMonth() + 1) * 100000000 + date.getDate() * 1000000 + date.getHours() * 10000 + date.getMinutes() * 100 + date.getSeconds());
  return format.substr(0, 4) + "-" + format.substr(4, 2) + "-" + format.substr(6, 2) + "_" + format.substr(8, 2) + "-" + format.substr(10, 2) + "-" + format.substr(12, 2);
}

function replaceEntities(string)
{
  return string.replace(/&quot;/g, '"').replace(/&amp;/g, '&');
}

function replaceMacrons(string)
{
  return string.replace(/ā/g, "â").replace(/Ā/g, "Â").replace(/ē/g, "ê").replace(/Ē/g, "Ê").replace(/ī/g, "î").replace(/Ī/g, "Î").replace(/ō/g, "ô").replace(/Ō/g, "Ô").replace(/ū/g, "û").replace(/Ū/g, "Û");
}

function patchExport(data)
{
  data.forEach(function(data)
  {
    if ((data.format == 1) && (data.image.endsWith(`//i.ytimg.com/vi/${data.cid}/default.jpg`)))
    {
      data.image = "";
    }
    data.title = replaceEntities(data.title);
    data.author = replaceEntities(data.author);
  });
  return data;
}

function generateTsv(tsv)
{
  const link = document.createElement("a");
  link.setAttribute("download", "export_" + tsvTypeExport + "_" + formatDate(new Date()) + ".tsv");
  link.setAttribute("href", "data:text/tab-separated-values;charset=utf-8;base64," + window.btoa(unescape(encodeURIComponent(tsv))));
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function exportTsv()
{
  const plColumns = tsvExportColumns.filter(column => column.startsWith("pl-"));
  const atColumns = plColumns.map(column => column.substr(3));
  const columns = tsvExportColumns.filter(column => !column.startsWith("pl-"));
  const header = plColumns.join(tsvColumnSeparator) + tsvColumnSeparator + columns.join(tsvColumnSeparator);
  const playlists = getPlaylists().filter(playlist => playlist.attributes.checked);
  if (playlists.length == 0)
  {
    const playlist = {name: "History", id: ""};
    generateTsv(patchExport(API.getHistory().map(history => history.media).slice()).reduce((tsv, row) => columns.reduce((tsv, column) => tsv + tsvColumnSeparator + row[column], atColumns.reduce((tsv, column, index) => tsv + ((index > 0) ? tsvColumnSeparator : "") + playlist[column], tsv + tsvRowTerminator), tsv), header));
  }
  else
  {
    playlists.filter(playlist => playlist.attributes.checked).reduce((tsv, playlist) => tsv.then(tsv => fetchPlaylist(playlist.id).then(data => patchExport(data).reduce((tsv, row) => columns.reduce((tsv, column) => tsv + tsvColumnSeparator + row[column], atColumns.reduce((tsv, column, index) => tsv + ((index > 0) ? tsvColumnSeparator : "") + playlist.attributes[column], tsv + tsvRowTerminator)), tsv))), Promise.resolve(header)).then(generateTsv);
  }
}

function createPlaylistsButtons()
{
  if ($(".playlist-buttons-import-export-tsv").length == 0)
  {
    const playlistButtonsImportExportTsv = $('<div class="playlist-buttons-import-export-tsv"></div>');

    let playlistExportTsv = $('<div id="playlist-export-tsv" class="button"><i class="fa fa-sign-in"></i><span>Export TSV</span></div>');
    playlistExportTsv.click(function(event)
    {
      if (event.ctrlKey && event.altKey)
      {
        tsvExportColumns = tsvExportColumnsAdvanced;
        tsvTypeExport = tsvTypeExportAdvanced;
      }
      else
      {
        tsvExportColumns = tsvExportColumnsNormal;
        tsvTypeExport = tsvTypeExportNormal;
      }
      exportTsv();
    });
    playlistButtonsImportExportTsv.append(playlistExportTsv);

    $('.playlist-buttons-content').append(playlistButtonsImportExportTsv);
  }
}

function createMediaUpdate()
{
  let index = $("#media-panel .media-list.playlist-media .row .actions").parent().index() + Math.floor($("#media-panel .media-list.playlist-media .row").first().height() / 55) - 1;
  if (index >= 0)
  {
    let media = getVisiblePlaylistMedias().slice(0)[index];
    if ($("#dialog-media-update .tag").length == 0)
    {
      const tag = $('<style scoped>.tag { position: absolute; background-color: #00c6ff; border-radius: 50%; right: 40px; top: 55px; width: 30px; height: 30px; cursor: pointer; } .tag i { left: 0; top: 0;} }</style><div class="tag"><i class="icon icon-import-big"></i></div>');
      tag.last().click(async function(event)
      {
        let data = await mediaTag(media.attributes.cid);
        if (data.status == "ok")
        {
          $(this).css("background-color", "#00c600");
          $("#dialog-media-update input[name=author]").val(data.author);
          $("#dialog-media-update input[name=title]").val(data.title);
        }
        else
        {
          $(this).css("background-color", "#c60000");
        }
      });
      $('#dialog-media-update .dialog-body').append(tag);
      const restore = $('<style scoped>.restore { position: absolute; background-color: #00c6ff; border-radius: 50%; right: 74px; top: 55px; width: 30px; height: 30px; cursor: pointer; } .restore i { left: 0; top: 0;} }</style><div class="restore"><i class="icon icon-refresh-video"></i></div>');
      restore.last().click(async function(event)
      {
        $("#dialog-media-update input[name=author]").val(media.attributes.author);
        $("#dialog-media-update input[name=title]").val(media.attributes.title);
      });
      $('#dialog-media-update .dialog-body').append(restore);
    }
  }
}

function closeUserLogoPopup()
{
  $(".user-logo-dropdown").parent().attr("data-state", "hidden").removeClass("user-profile-dropdown");
}

function createUserLogoBouncer()
{
  if ($(".user-logo").length == 0)
  {
    const bouncer = $('<div class="user-logo user-profile role-bouncer role-none"><div class="avatar-wrapper thumb small"><div class="background"></div>' + iconNolife(logoIndex, 'style="position: absolute; top: 2px; z-index: 2;"', 24, 20) + '</div></div>');
    bouncer.click(function(event)
    {
      const position = $(this).offset();
      const right = position.left + $(this).width() / 2;
      const bottom = position.top + $(this).height();
      const popover = $(".user-logo-dropdown").parent();
      popover.attr("data-state", "shown").addClass("user-profile-dropdown").css("left", (right - popover.width()) + "px").css("top", (bottom + 20) + "px");
      event.stopPropagation();
    });
    
    $(".user-profile").before(bouncer);

    let popover = '<div class="popover" data-state="hidden"><div class="user-logo-dropdown"><ul class="list-unstyled">';
    for(let i = 0; i < logoEdges.length; i++)
    {
      popover += '<li class="user-profile-dropdown__item user-action">' + iconNolife(i, "", 20, 16) + '<span class="user-profile-dropdown__item-text">' + resLogoTitles[i] + '</span></li>';
    }
    
    for(let i = 0; i < logoOldN.length; i++)
    {
      if (logoOldN[i] != undefined)
      {
        popover += `<li class="user-profile-dropdown__item user-action" style="position: absolute; min-width: 0; top: ${8 + 45 * i}px; left: 136px"><span class="user-profile-dropdown__item-text">${resOld}</span></li>`;
      }
    }
    popover += '</ul></div></div>';
    popover = $(popover);
    popover.find('li').click(function()
    {
      logoIndex = $(this).index();
      if (logoIndex >= logoLetters.length)
      {
        logoIndex += 2;
      }
      let room = document.getElementById("app").getAttribute("data-theme");
      logoChanged = ((room == nolifeTv) && (logoIndex != 7)) || ((room != nolifeTv) && (logoIndex != 0));
      if (logoIndex != tempLogoIndex)
      {
        previousLogoIndex = logoIndex;
        changeLogo();
      }
      panelNolifeUpdate();
      closeUserLogoPopup();
    }).mousedown(function(event)
    {
      event.stopPropagation();
    });
    $('.popover').filter(":last").after(popover);
    $(document).mousedown(closeUserLogoPopup);
  }
}

function createPlaylistButton(id, fa, click)
{
  if ($(`#playlist-${id}-button`).length == 0)
  {
    const button = $(`<div id="playlist-${id}-button" class="button"><i class="fa fa-${fa}"></i></div>`);
    button.click(click);
    $("#media-panel .playlist-buttons-container .playlist-edit-group").prepend(button);
  }
}

async function gear(playlists, id, initialCount, max, appendMode, maxArtist, checkMyHistory, checkHistory)
{
  let cids = getCids(checkMyHistory, checkHistory);
  let finalCount;
  if (appendMode == "overwrite")
  {
    finalCount = max;
  }
  else
  {
    finalCount = initialCount + max;
  }
  if (finalCount > maxPlaylist)
  {
    finalCount = maxPlaylist;
  }
  let randomIndexes = getPlaylistsIndexes(playlists);
  let count = initialCount;
  let artistCount = [];
  for(;;)
  {
    let removedIndexes = getRandomIndexes(randomIndexes, max);
    let randomPlaylist = await getRandomPlaylist(playlists, randomIndexes, artistCount, maxArtist, cids);
    if ((appendMode == "overwrite") && (initialCount != 0))
    {
      await clearPlaylist(id);
      initialCount = 0;
    }
    if (randomPlaylist.length > 0)
    {
      let data = await insertPlaylist(id, randomPlaylist, appendMode == "end");
      count = await data[0].count;
      max = finalCount - count;
      if (max <= 0)
      {
        break;
      }
    }
    randomIndexes = removedIndexes;
    if (randomIndexes.length == 0)
    {
      break;
    }
  }
  await refreshPlaylist(id, count);
}

function gearDialog(playlists, id, name, count, total)
{
  $("#dialog-container").html(`<div id="dialog-playlist-delete" class="dialog destructive no-submit"><div class="dialog-frame"><span class="title">${resGearPlaylist}</span><i class="icon icon-dialog-close"></i></div><div class="dialog-body"><span class="message">${resGearName(name)}</span><div class="dialog-input-container"><span class="dialog-input-label">${resTypeTracksCountToGenerate(total)}</span><div class="dialog-input-background"><input type="text" maxlength="3" placeholder="${resTypeTracksCount}" name="max-tracks" value=""></div></div><div class="dialog-input-container"><span class="dialog-input-label">${resMaxByArtist}</span><div class="dialog-input-background"><input type="text" maxlength="3" placeholder="${resTypeMaxByArtist}" name="max-by-artist" value=""></div></div><div class="dialog-input-container"><div class="dialog-input-background" style="height: 39px"><dl id="dropdownAppendMode" class="dropdown"><dt><span>${resBeginning}</span><i id="down" class="fa fa-angle-down"></i><i class="fa fa-angle-up" id="up"></i></dt><dd><div class="row selected" data-value="beginning"><span>${resBeginning}</span></div><div class="row" data-value="end"><span>${resEnd}</span></div><div class="row" data-value="overwrite"><span>${resOverwrite}</span></div></dd></dl></div></div></div><div class="dialog-frame"><div class="button cancel"><span>${resCancel}</span></div><div class="button submit"><span>${resGearPlaylist}</span></div></div></div>`).css("display", "block").click(function(event)
  {
    let cid = $(event.target).prop('id');
    if (cid == "")
    {
      cid = $(event.target).prop('class');
      if (cid == "")
      {
        cid = $(event.target).parent().prop('class');
      }
    }

    if (cid == "button submit")
    {
      if ($("#dialog-playlist-delete").hasClass("no-submit") == false)
      {
        gear(playlists, id, count, parseInt($("#dialog-playlist-delete input[name=max-tracks]").val(), 10), $("#dialog-playlist-delete #dropdownAppendMode dd .row.selected").attr("data-value"), parseInt($("#dialog-playlist-delete input[name=max-by-artist]").val(), 10), true, true);
      }
      else
      {
        cid = "";
      }
    }
    
    if (["dialog-container", "icon icon-dialog-close", "button submit", "button cancel"].includes(cid))
    {
      $(this).html('').css("display", "none");
      $(this).unbind(event);
    }
  });
  $("#dialog-playlist-delete input").focus(function()
  {
    $(this).parent().addClass("focused");
  }).blur(function()
  {
    $(this).parent().removeClass("focused");
  }).keydown(function(event)
  {
    if (event.which == 13)
    {
      event.preventDefault();
      $("#dialog-playlist-delete .button.submit").click();
    }
  }).keyup(function()
  {
    const maxTracks = parseInt($("#dialog-playlist-delete input[name=max-tracks]").val(), 10);
    const maxByArtist = $("#dialog-playlist-delete input[name=max-by-artist]").val();
    if (maxTracks >= 1 && maxTracks <= maxPlaylist && ((maxByArtist == "") || (parseInt(maxTracks, 10) >= 1 && parseInt(maxTracks, 10) <= maxPlaylist)))
    {
      $("#dialog-playlist-delete").removeClass("no-submit");
    }
    else
    {
      $("#dialog-playlist-delete").addClass("no-submit");
    }
  });
  $("#dialog-playlist-delete dt").click(function()
  {
    $(this).parent().toggleClass("open");
  });
  $("#dialog-playlist-delete dd .row").click(function()
  {
    $(this).parent().find(".row").removeClass("selected");
    $(this).addClass("selected").parent().parent().removeClass("open").find("dt span").html($(this).find("span").html());
  });
}

async function clear(id, medias)
{
  let data;
  if (medias)
  {
    data = await deletePlaylist(id, medias);
  }
  else
  {
    data = await clearPlaylist(id);
  }
  const count = await data.length;
  await refreshPlaylist(id, count);
}

function clearCheckedDialog(id, name, medias)
{
  $("#dialog-container").html(`<div id="dialog-confirm" class="dialog destructive"><div class="dialog-frame"><span class="title">${resDeleteMedia}</span><i class="icon icon-dialog-close"></i></div><div class="dialog-body"><span class="message" style="top: 63.5px;">${(medias.length == 1) ? resDeleteItem(medias[0].attributes.author, medias[0].attributes.title) : resDeleteItems(medias.length)}</span></div><div class="dialog-frame"><div class="button cancel"><span>${resCancel}</span></div><div class="button submit"><span>${resDeleteMedia}</span></div></div></div>`).css("display", "block").click(function(event)
  {
    let cid = $(event.target).prop('id');
    if (cid == "")
    {
      cid = $(event.target).prop('class');
      if (cid == "")
      {
        cid = $(event.target).parent().prop('class');
      }
    }

    if (cid == "button submit")
    {
      if ($("#dialog-confirm").hasClass("no-submit") == false)
      {
        clear(id, medias);
      }
      else
      {
        cid = "";
      }
    }

    if (["dialog-container", "icon icon-dialog-close", "button submit", "button cancel"].includes(cid))
    {
      $(this).html('').css("display", "none");
      $(this).unbind(event);
    }
  });
}

function clearAllDialog(id, name)
{
  const code = getRandomInt(900) + 100;
  $("#dialog-container").html(`<div id="dialog-playlist-delete" class="dialog destructive no-submit"><div class="dialog-frame"><span class="title">${resClearPlaylist}</span><i class="icon icon-dialog-close"></i></div><div class="dialog-body"><span class="message">${resClearName(name)}</span><div class="dialog-input-container"><span class="dialog-input-label">${resTypeCodeToClear(code)}</span><div class="dialog-input-background"><input type="text" maxlength="3" placeholder="${resTypeCode(code)}" name="code" value=""></div></div></div><div class="dialog-frame"><div class="button cancel"><span>${resCancel}</span></div><div class="button submit"><span>${resClearPlaylist}</span></div></div></div>`).css("display", "block").click(function(event)
  {
    let cid = $(event.target).prop('id');
    if (cid == "")
    {
      cid = $(event.target).prop('class');
      if (cid == "")
      {
        cid = $(event.target).parent().prop('class');
      }
    }

    if (cid == "button submit")
    {
      if ($("#dialog-playlist-delete").hasClass("no-submit") == false)
      {
        clear(id);
      }
      else
      {
        cid = "";
      }
    }
    
    if (["dialog-container", "icon icon-dialog-close", "button submit", "button cancel"].includes(cid))
    {
      $(this).html('').css("display", "none");
      $(this).unbind(event);
    }
  });
  $("#dialog-playlist-delete input").focus(function()
  {
    $(this).parent().addClass("focused");
  }).blur(function()
  {
    $(this).parent().removeClass("focused");
  }).keydown(function(event)
  {
    if (event.which == 13)
    {
      event.preventDefault();
      $("#dialog-playlist-delete .button.submit").click();
    }
  }).keyup(function()
  {
    if ($(this).val() == code)
    {
      $("#dialog-playlist-delete").removeClass("no-submit");
    }
    else
    {
      $("#dialog-playlist-delete").addClass("no-submit");
    }
  });
}

function createGearButton()
{
  createPlaylistButton("gears", "gears", function()
  {
    let id = -1;
    let name = "";
    let count = 0;
    let total = 0;
    let playlists = getPlaylists();
    let checkedPlaylists = playlists.reduce(function (result, element, index, array)
    {
      let last = 0;
      if (result.length > 0) last = result[result.length - 1].last;
      if (element.attributes.visible)
      {
        id = element.attributes.id;
        name = element.attributes.name;
        count = element.attributes.count;
      }
      else if (element.attributes.checked)
      {
        result.push({name: element.attributes.name, count: element.attributes.count, id: element.attributes.id, first: last, last: last + element.attributes.count});
        total += element.attributes.count;
      }
      return result;
    }, []);
    if ((id != -1) && (checkedPlaylists.length > 0))
    {
      gearDialog(checkedPlaylists, id, name, count, total);
    }
  });
}

function createClearButton()
{
  createPlaylistButton("clear", "eraser", function()
  {
    const visiblePlaylist = getVisiblePlaylist();
    if (visiblePlaylist != undefined)
    {
      const medias = getCheckedPlaylistMedias().slice(0);
      if (medias.length)
      {
        clearCheckedDialog(visiblePlaylist.attributes.id, visiblePlaylist.attributes.name, medias);
      }
      else
      {
        clearAllDialog(visiblePlaylist.attributes.id, visiblePlaylist.attributes.name);
      }
    }
  });
}

async function sort(id)
{
  const medias = getVisiblePlaylistMedias();
  medias.sort((element1, element2) => (element1.attributes.author == element2.attributes.author) ? element1.attributes.title.localeCompare(element2.attributes.title) : element1.attributes.author.localeCompare(element2.attributes.author));
  const data = await movePlaylist(id, medias, -1);
  const count = await data.length;
  await refreshPlaylist(id, count);
}

function sortDialog(id, name)
{
  $("#dialog-container").html(`<div id="dialog-confirm" class="dialog destructive"><div class="dialog-frame"><span class="title">${resSortPlaylist}</span><i class="icon icon-dialog-close"></i></div><div class="dialog-body"><span class="message" style="top: 63.5px;">${resSortName(name)}</span></div><div class="dialog-frame"><div class="button cancel"><span>${resCancel}</span></div><div class="button submit"><span>${resSortPlaylist}</span></div></div></div>`).css("display", "block").click(function(event)
  {
    let cid = $(event.target).prop('id');
    if (cid == "")
    {
      cid = $(event.target).prop('class');
      if (cid == "")
      {
        cid = $(event.target).parent().prop('class');
      }
    }

    if (cid == "button submit")
    {
      if ($("#dialog-confirm").hasClass("no-submit") == false)
      {
        sort(id);
      }
      else
      {
        cid = "";
      }
    }

    if (["dialog-container", "icon icon-dialog-close", "button submit", "button cancel"].includes(cid))
    {
      $(this).html('').css("display", "none");
      $(this).unbind(event);
    }
  });
}

function createSortButton()
{
  createPlaylistButton("sort", "sort-alpha-asc", function()
  {
    const visiblePlaylist = getVisiblePlaylist();
    if (visiblePlaylist != undefined)
    {
      if (visiblePlaylist.attributes.active)
      {
        sortDialog(visiblePlaylist.attributes.id, visiblePlaylist.attributes.name);
      }
      else
      {
        sort(visiblePlaylist.attributes.id);
      }
    }
  });
}

function createRefreshButton()
{
  createPlaylistButton("refresh", "refresh", function()
  {
    const visiblePlaylist = getVisiblePlaylist();
    if (visiblePlaylist != undefined)
    {
      refreshPlaylist(visiblePlaylist.attributes.id);
    }
  });
}

async function paste()
{
  if (clipBoard.id && clipBoard.medias.length > 0)
  {
    const visiblePlaylist = getVisiblePlaylist();
    if (visiblePlaylist != undefined)
    {
      let id = visiblePlaylist.attributes.id;
      let count;
      try
      {
      let data = await insertPlaylist(id, clipBoard.medias, false);
        count = await data[0].count;
      }
      catch (exception)
      {
        if (exception == "maxItems")
        {
          count = maxPlaylist;
        }
        else
        {
          throw exception;
        }
      }
      await refreshPlaylist(id, count);

      if ((clipBoard.cut) && (id != clipBoard.id))
      {
        let data = await fetchPlaylist(id);
        let ids = clipBoard.medias.map(element => element.id);
        let medias = await data.filter(element => ids.includes(element.id));
        data = await deletePlaylist(clipBoard.id, medias);
        let count = await data.length;
        refreshPlaylist(clipBoard.id, count);
      }
    }
  }
}

function copyCut(cut)
{
  clipBoard.cut = cut;
  clipBoard.id = getVisiblePlaylist().attributes.id;
  clipBoard.medias = getCheckedPlaylistMedias().slice(0);
}

function createCutCopyPasteButton()
{
  createPlaylistButton("paste", "paste", function()
  {
    paste();
  });
  createPlaylistButton("copy", "copy", function()
  {
    copyCut(false);
  });
  createPlaylistButton("cut", "cut", function()
  {
    copyCut(true);
  });
}

function createPlaylistsCheckboxes()
{
  const playlists = getPlaylists();
  const rows = $("#playlist-menu .menu .container .row");
  rows.each(function(index, element)
  {
    if ($(element).find("div.item").length == 0)
    {
      let selected = "";
      if (playlists[index].attributes.checked)
      {
        selected = " selected";
      }
      const checkbox = $('<div class="item' + selected + '"><i class="icon icon-check-blue"></i></div>');
      checkbox.click(function(event)
      {
        if (event.detail == 1)
        {
          $(this).toggleClass("selected");
        }
        const parent = $(this).parent();
        const index = parent.index();
        const playlists = getPlaylists();
        const checked = $(this).hasClass("selected");
        playlists[index].attributes.checked = checked;
        if ((event.ctrlKey) || (event.detail > 1))
        {
          const name = playlists[index].attributes.name;
          const minus = name.indexOf("-");
          if (minus >= 0)
          {
            const prefix = name.substr(0, minus + 1);
            playlists.forEach(function(element, index)
            {
              if ((element.attributes.name.startsWith(prefix)) && (checked != (element.attributes.checked == true)))
              {
                element.attributes.checked = checked;
                parent.parent().find("div.item").eq(index).toggleClass("selected");
              }
            });
          }
        }
        else if (event.altKey)
        {
          playlists.forEach(function(element, index)
          {
            if (checked != (element.attributes.checked == true))
            {
              element.attributes.checked = checked;
              parent.parent().find("div.item").eq(index).toggleClass("selected");
            }
          });
        }
        event.stopPropagation();
      }).mouseup(function(event)
      {
        event.stopPropagation();
      });
      $(element).prepend(checkbox);
    }
  });
}

function createMediasCheckboxes()
{
  if (busyMediasCheckboxes) return;
  busyMediasCheckboxes = true;

  const medias = getVisiblePlaylistMedias();
  const rows = $("#media-panel .media-list.playlist-media .row");
  const lastIndex = rows.length - 1;

  let offsetIndex = 0;

  rows.each(function(index, element)
  {
    if (index == 0)
    {
      if ($(this).prop('class') == "row")
      {
        offsetIndex = Math.floor($(this).height() / 55) - 1;
      }
      else
      {
        return false;
      }
    }
    else if (index < lastIndex)
    {
      let checkbox = $(element).find("div.item");
      if (checkbox.length == 0)
      {
        checkbox = $('<div class="item"><i class="icon icon-check-blue"></i></div>');
        $(element).prepend(checkbox);
      }
      else
      {
        checkbox.unbind();
      }
      const mediaIndex = index + offsetIndex;
      if ((mediaIndex < medias.length) && medias[mediaIndex].attributes.checked)
      {
        checkbox.addClass("selected");
      }
      else
      {
        checkbox.removeClass("selected");
      }
      checkbox.click(function(event)
      {
        busyMediasCheckboxes = true;
        if (event.detail == 1)
        {
          $(this).toggleClass("selected");
        }
        const medias = getVisiblePlaylistMedias();
        const media = medias[mediaIndex];
        const checked = $(this).hasClass("selected");
        media.attributes.checked = checked;
        const parent = $(this).parent().parent();
        if ((event.ctrlKey) || (event.detail > 1))
        {
          const author = getAuthor(media.attributes.author);
          medias.forEach(function(element, index)
          {
            if ((author == getAuthor(element.attributes.author)) && (checked != (element.attributes.checked == true)))
            {
              element.attributes.checked = checked;
              if ((index > offsetIndex) && (index < lastIndex + offsetIndex))
              {
                parent.find("div.item").eq(index - offsetIndex - 1).toggleClass("selected");
              }
            };
          });
        }
        else if (event.altKey)
        {
          medias.forEach(function(element, index)
          {
            if (checked != (element.attributes.checked == true))
            {
              element.attributes.checked = checked;
              if ((index > offsetIndex) && (index < lastIndex + offsetIndex))
              {
                parent.find("div.item").eq(index - offsetIndex - 1).toggleClass("selected");
              }
            };
          });
        }
        event.stopPropagation();
        busyMediasCheckboxes = false;
      }).mouseup(function(event)
      {
        event.stopPropagation();
      }).mousedown(function(event)
      {
        event.stopPropagation();
      });
    }
  });
  busyMediasCheckboxes = false;
}

function createObservers()
{
  if (observerMediaPanel == null)
  {
    observerMediaPanel = createObserver(document.getElementById('media-panel'), { attributes: false, childList: true, subtree: true }, function(mutationsList, observer)
    {
      for(let mutation of mutationsList)
      {
        if ((mutation.type == 'childList') && (mutation.target.className == "header no-icon"))
        {
          createPlaylistButtons();
          break;
        }
      }
      if (busyMediasCheckboxes)
      {
        return;
      }
      for(let mutation of mutationsList)
      {
        if ((mutation.type == 'childList') && (mutation.target.className.startsWith("row playlist-media-")))
        {
          createMediasCheckboxes();
          break;
        }
      }
    });
  }

  if (observerPlaylistMenu == null)
  {
    observerPlaylistMenu = createObserver(document.getElementById('playlist-menu'), { attributes: false, childList: true, subtree: true }, function(mutationsList, observer)
    {
      for(let mutation of mutationsList)
      {
        if ((mutation.type == 'childList') && (mutation.target.className == "row"))
        {
          createPlaylistsCheckboxes();
          break;
        }
      }
    });
  }

  if (observerApp == null)
  {
    observerApp = createObserver(document.getElementById('app'), { attributes: true, childList: false, subtree: false }, function(mutationsList, observer)
    {
      for(let mutation of mutationsList)
      {
        if ((mutation.type == 'attributes') && (mutation.attributeName == 'data-theme'))
        {
          enterRoom(app.getAttribute(mutation.attributeName));
          break;
        }
      }
    });
  }

  if (observerDialogContainer == null)
  {
    observerDialogContainer = createObserver(document.getElementById('dialog-container'), { attributes: false, childList: true, subtree: true }, function(mutationsList, observer)
    {
      for(let mutation of mutationsList)
      {
        if ((mutation.type == 'childList') && (mutation.target.id == 'dialog-media-update'))
        {
          createMediaUpdate();;
          break;
        }
      }
    });
  }
}

function refreshPlaylist(id, count)
{
  const rows = $("#playlist-menu .menu .container .row");
  const playlists = getPlaylists();
  if (rows.length == playlists.length)
  {
    const index = playlists.findIndex(element => element.attributes.id == id);
    if (index != -1)
    {
      const row = rows.eq(index);
      if (count != undefined)
      {
        row.find("span.count").html("(" + count + ")");
        playlists[index].attributes.count = count;
      }
      if (row.hasClass("selected"))
      {
        playlists[index].attributes.visible = false;
        row.toggleClass("selected");
        row.mouseup();
      }
    }
  }
}

function getRandomInt(max)
{
  return Math.floor(Math.random() * Math.floor(max));
}

function shuffle(array)
{
  for (let i = array.length - 1; i > 0; i--)
  {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function getPlaylistsIndexes(playlists)
{
  let playlistsIndexes = [];

  for(let i = playlists[0].first; i < playlists[playlists.length - 1].last; i++)
  {
    playlistsIndexes.push(i);
  }
  return playlistsIndexes;
}

function getRandomIndexes(randomIndexes, count)
{
  let removedIndexes = [];
  while(randomIndexes.length > count)
  {
    const index = getRandomInt(randomIndexes.length);
    removedIndexes.push(randomIndexes.splice(index, 1)[0]);
  }
  shuffle(randomIndexes);
  return removedIndexes;
}

async function fetchPlaylist(id)
{
  const response = await fetch('/_/playlists/' + id + '/media');
  const json = await response.json();
  return await json.data;
}

function getAuthor(author)
{
  author = author.toLowerCase().trim();
  if ((author.length > 3) && (author.substr(author.length - 3, 1) == "'") && (author.substr(author.length - 2, 1) >= "0") && (author.substr(author.length - 2, 1) <= "9")  && (author.substr(author.length - 1, 1) >= "0") && (author.substr(author.length - 1, 1) <= "9"))
  {
    author = author.substring(0, author.length - 3).trim();
  }
  author = author.replace(" feat.", "×");
  author = author.split("×")[0];
  return author.trim();
}

async function getRandomPlaylist(playlists, randomIndexes, artistCount, maxArtist, cids)
{
  let randomPlaylists = [];
  for(let i = 0; i < randomIndexes.length; i++)
  {
    let index = randomIndexes[i];
    let playlist = playlists.find(element => index < element.last);
    if (!playlist.data)
    {
      playlist.data = await fetchPlaylist(playlist.id);
    }
    
    let media = playlist.data[index - playlist.first];
    if (cids.includes(media.cid))
    {
      continue;
    }
    if (maxArtist > 0)
    {
      let author = getAuthor(media.author);
      let count = artistCount[author];
      if (count == undefined)
      {
        count = 0;
      }
      if (count >= maxArtist)
      {
        continue;
      }
      artistCount[author] = ++count;
    }
    randomPlaylists.push(media);
  }
  return randomPlaylists;
}

async function movePlaylist(id, playlist, beforeId)
{
  const ids = {ids: playlist.map(element => element.id), beforeID: beforeId};
  const rawResponse = await fetch('https://plug.dj/_/playlists/' + id +'/media/move', {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(ids)
  });
  const content = await rawResponse.json();
  return await content.data;
}

async function insertPlaylist(id, ids, append, media)
{
  const body = {media: (ids != null) ? ids.map(element => element.id) : media, append: append};
  const rawResponse = await fetch('https://plug.dj/_/playlists/' + id +'/media/insert', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  const content = await rawResponse.json();
  if (await content.status != "ok")
  {
    throw await content.status;
  }
  return await content.data;
}

async function deletePlaylist(id, medias)
{
  const ids = {ids: medias.map(element => element.id)};
  const rawResponse = await fetch('https://plug.dj/_/playlists/' + id +'/media/delete', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(ids)
  });
  const content = await rawResponse.json();
  return await content.data;
}

async function clearPlaylist(id)
{
  return await deletePlaylist(id, getVisiblePlaylistMedias());
}

async function skipMe()
{
  const rawResponse = await fetch('https://plug.dj/_/booth/skip/me', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  });
  const content = await rawResponse.json();
  return await content.data;
}

async function djLeave()
{
  const rawResponse = await fetch('https://plug.dj/_/booth', {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  });
  const content = await rawResponse.json();
  return await content.data;
}

async function mediaTag(cid)
{
  const response = await fetch('https://script.google.com/macros/s/AKfycbzGVC-_Y9ABtv9g7pxrZeKYl_oJxNX41P7tlxqfmnNZkVbVufa4/exec?cid=' + cid);
  const json = await response.json();
  return await json;
}

function getCids(myHistory, history)
{
  let cids = [];
  if (myHistory)
  {
    cids = getMyHistory().map(element => element.attributes.media.attributes.cid);
  }
  if (history)
  {
    cids = cids.concat(API.getHistory().map(element => element.media.cid));
  }
  return cids;
}

function getVisiblePlaylistMedias()
{
  return _.find(require.s.contexts._.defined, m => m && m instanceof Backbone.Collection && m._events && m._events["change:author"]).models;
}

function getCheckedPlaylistMedias()
{
  return getVisiblePlaylistMedias().filter(element => element.attributes.checked);
}

function getMyHistory()
{
  return _.find(require.s.contexts._.defined, m => m && m instanceof Backbone.Collection && m._events == undefined && typeof m.model === "function" && m.model.prototype.defaults.hasOwnProperty("room")).models;
}

function getPlaylists()
{
  return _.find(require.s.contexts._.defined, m => m && m instanceof Backbone.Collection && typeof m.jumpToMedia === 'function').models;
}

function getVisiblePlaylist()
{
  return getPlaylists().find(element => element.attributes.visible == true);
}

function skipTimerEvent()
{
  const media = API.getMedia();
  if (skipAtLeave)
  {
    if ((API.getDJ().id != API.getUser().id) || (media == undefined) || (media.id != skipAtId))
    {
      djLeave();
      skipAtTime = undefined;
    }
    else
    {
      const time = skipAtTime - API.getTimeElapsed();
      if (time <= 0)
      {
        djLeave();
        skipAtTimer = undefined;
      }
      else
      {
        skipAtTimer = setTimeout(skip, time * 1000);
      }
    }
  }
  else if (API.getDJ().id == API.getUser().id)
  {
    if ((media != undefined) && (media.id == skipAtId))
    {
      const time = skipAtTime - API.getTimeElapsed();
      if (time <= 0)
      {
        skipMe();
        skipAtTimer = undefined;
      }
      else
      {
        skipAtTimer = setTimeout(skipTimerEvent, time * 1000);
      }
    }
  }
}

function rescale()
{
  const communityPlayingTop = $('.community__playing-top');
  if (communityPlayingTop.length)
  {
    if (scale == "")
    {
      communityPlayingTop.css("overflow", "");
    }
    else
    {
      communityPlayingTop.css("overflow", "hidden");
    }
    const ytFrame = $('#yt-frame');
    if (ytFrame.length)
    {
      if (scale == "")
      {
        ytFrame.css("transform", "");
      }
      else
      {
        ytFrame.css("transform", "scale(" + scale + ")");
      }

      const fullscreenLayer = $("#fullscreen-layer");
      if (fullscreenLayer.length)
      {
        let height = fullscreenLayer.width() * 9 / 16;
        if (fullscreenLayer.height() > height)
        {
          ytFrame.css("max-height", height).css("top", ($("#fullscreen-layer").height() - height) / 2);
        }
        else
        {
          ytFrame.css("max-height", "").css("top", "");
        }
      }
    }
  }
}

function advance()
{
  if (skipAtTimer != undefined)
  {
     clearTimeout(skipAtTimer);
     if (skipAtLeave)
     {
       djLeave();
     }
     skipAtTimer = undefined;
  }

  let nextLogoIndex = previousLogoIndex;
  tempLogoIndex = undefined;
  const media = API.getMedia();
  if (media)
  {
    let title = media.author + "\n" + media.title;
    
    if (media.author.trim() == "[Nolife]")
    {
      tempLogoIndex = nextLogoIndex = 0;
    }
    else
    {
      for(let i = 0; i < logoTags.length; i++)
      {
        let tag = "[" + logoTags[i] + "]";
        if (title.includes(tag))
        {
          removeTag(tag);
          title = title.replace(tag, "");
          tempLogoIndex = nextLogoIndex = i;
          break;
        }
        if (logoOldN[i] != undefined)
        {
          tag = "[" + logoTags[i] + "O]";
          if (title.includes(tag))
          {
            removeTag(tag);
            title = title.replace(tag, "");
            tempLogoIndex = nextLogoIndex = i + logoTags.length;
            break;
          }
        }
      }
    }

    let exp, match;

    exp = /.*(\[SCALE ?)(1.[0-9]+)([, ](1.[0-9]+))?(\]).*/;
    match = exp.exec(title);
    if ((match != null) && (match.length == 6))
    {
      scale = match[2];
      let tag = match[1] + match[2];
      if (match[4] != undefined)
      {
        scale += ", " + match[4];
        tag += match[3] + match[4];
      }
      tag += match[5];
      title = title.replace(tag, "");
      removeTag(tag);
      rescale();
    }
    else
    {
      scale = "";
      rescale();
    }

    exp = /.*(\[SKIP ?AT ?)([0-9]+)(:[0-5][0-9])?(:[0-5][0-9])?(\]).*|.*(\[DJLEAVE AFTER\]).*/;
    match = exp.exec(title);
    if ((match != null) && (match.length == 7))
    {
      let tag, time, leave;
      if (match[6] != undefined)
      {
        leave = true;
        tag = match[6];
        time = media.duration - 1.0;
      }
      else
      {
        leave = false;
        tag = match[1] + match[2]
        time = parseInt(match[2], 10);
        for(let i = 3; i < 5; i++)
        {
          if (match[i] != undefined)
          {
            tag += match[i];
            time = time * 60 + parseInt(match[i].substr(1, 2), 10);
          }
        }
        tag += match[5];
      }

      title = title.replace(tag, "");
      removeTag(tag);
      if (time < media.duration)
      {
        if (API.getDJ().id == API.getUser().id)
        {
          time = time - API.getTimeElapsed();
          skipAtId = media.id;
          skipAtTime = time;
          skipAtLeave = leave;
          if (time <= 0)
          {
            skipTimerEvent();
          }
          else
          {
            skipAtTimer = setTimeout(skipTimerEvent, time * 1000);
          }
        }
      }
    }

    exp = /.*(\[NL[BT]P ?)([1-9][0-9]+)?(\]).*/;
    match = exp.exec(title);
    if ((match != null) && (match.length == 4))
    {
      let tag = match[1];
      panelNolifeRight = match[2];
      if (match[2] != undefined)
      {
        tag += match[2];
      }
      tag += match[3];
      title = title.replace(tag, "");
      removeTag(tag);
      panelNolifeAuthor = replaceMacrons(replaceEntities(title.split("\n")[0])).trim();
      panelNolifeTitle = replaceMacrons(replaceEntities(title.split("\n")[1])).trim();
      panelNolifeTop = match[1].substr(3, 1) == "T";
    
      let time = API.getTimeElapsed();
      if (time <= 10)
      {
        let panelNolife = $("#panel-nolife");
        if (panelNolife)
        {
          panelNolife.remove();
        }
        panelNolifeDelay = 10 - time;
      }
      else
      {
        panelNolifeDelai = 0;
      }
    }
    else
    {
      panelNolifeAuthor = "";
      panelNolifeTitle = "";
    }
  }
  if (nextLogoIndex != logoIndex)
  {
    logoIndex = nextLogoIndex;
    logoNolifeTimerEvent();
  }
  panelNolifeUpdate();
}

function enterRoom(room)
{
  if (!logoChanged)
  {
    if ((room == "nolife-tv") && (logoIndex != 7))
    {
      logoIndex = 7;
      previousLogoIndex = 7;
      changeLogo();
    }
    else if (logoIndex != 0)
    {
      logoIndex = 0;
      previousLogoIndex = 0;
      changeLogo();
    }
  }
  setTimeout(advance, 500);
}

function removeTag(tag)
{
  $(".community__song-playing").each(function(index, element)
  {
    $(this).html($(this).html().replace(tag, ""));
  });
}

function iconNolife(logoIndex, style, width, height)
{
  return `<svg width="${width}" height="${height}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ${style}><g transform="scale(${width / 320.0})"><path style="fill: ${(logoIndex < logoEdges.length) ? logoEdges[logoIndex] : '#00000000'}" d="M0,22 A22,22,0,0,1,22,0 L118,0 A62,62,0,0,1,168,25 A22,22,0,0,1,190,0 L239,0 A22,22,0,0,1,261,22L261,100 L298,100 A22,22,0,0,1,319,124 L319,170 L320,227 A22,22,0,0,1,298,250 L62,250 A62,62,0,0,1,0,188 Z M85,185 L84,185 L101,227 L102,227 L304 215 L287,173 Z" /><path style="fill: ${(logoIndex < logoLetters.length) ? logoLetters[logoIndex] : '#00000000'}" d="M 85,185 L287,173 L304 215 L102,227 Z M22,31 L116,29 A37,37,0,0,1,153,56 L155,160 L112,161 L110,68 A7,7,0,0,0,102,60 L65,62 L68,178 A7,7,0,0,0,75,185 L85,185 L102,227 L61,228 A37,37,0,0,1,24,192 Z M189,26 L232,25 L234,117 A7,7,0,0,0,241,124 L295,123 L296,155 L228,156 A37,37,0,0,1,192,119Z" /></g><g transform="scale(${width / 90.0})"><path style="fill: ${(logoIndex >= logoEdges.length) ? logoOldN[logoIndex - logoEdges.length] : '#00000000'}" d="M 21.84375,11.28125 C 16.944888,11.386012 13,15.272829 13,21.6875 L 13,61.5 C 13,67.871 18.129,73 24.5,73 l 261,0 0,-8.09375 -256,0 c -3.601,0 -6.5,-2.899 -6.5,-6.5 L 23,26.6875 C 23,23.363033 26.065793,22.616877 28.3125,26 L 45.5,51.90625 C 54.510486,65.474365 67,61.87387 67,48 l 0,-36 -10,0 0,31 c 0,3.835577 -3.236752,4.375503 -5.8125,0.6875 L 33.59375,18.5 c -3.559047,-5.095908 -7.939774,-7.300232 -11.75,-7.21875 z" /></g></svg>`;
}

function changeLogo()
{
  logoNolifeTimerEvent();
  const path = $(".user-logo svg path");
  path.eq(0).attr('style', 'fill: ' + ((logoIndex < logoEdges.length) ? logoEdges[logoIndex] : '#00000000'));
  path.eq(1).attr('style', 'fill: ' + ((logoIndex < logoLetters.length) ? logoLetters[logoIndex] : '#00000000'));
  path.eq(2).attr('style', 'fill: ' + ((logoIndex >= logoEdges.length) ? logoOldN[logoIndex - logoEdges.length] : '#00000000'));
}

function panelNolifeUpdate()
{
  let panelNolife = $("#panel-nolife");
  if ((logoIndex > 0) && (panelNolifeAuthor != "") && (panelNolifeTitle != ""))
  {
    const ytFrame = $("#yt-frame");
    if (ytFrame.length == 0)
    {
      return;
    }
    if (panelNolife.length == 0)
    {
      panelNolife = $('<div id="panel-nolife" class="unselectable"><div class="title-nolife unselectable"></div><div class="author-nolife unselectable"></div><div class="author-front-nolife unselectable"></div></div>');
      if (panelNolifeDelay)
      {
        panelNolife.css("animation-fill-mode", "forwards").css("animation-name", "unfade").css("animation-delay", panelNolifeDelay + "s").css("animation-duration", "1s").css("opacity", "0");
      }
      ytFrame.before(panelNolife);
    }

    panelNolife.find('.title-nolife').text(panelNolifeTitle);
    panelNolife.find('.author-nolife, .author-front-nolife').text(panelNolifeAuthor);

    let right;
    if (panelNolifeRight == undefined)
    {
      right = Math.floor(15 - 10 * (Math.min(518, Math.max(38, Math.max(panelNolife.find(".title-nolife").width(), panelNolife.find(".author-nolife").width()))) - 38) / (518 - 38)) * 25;
      
    }
    else
    {
      right = panelNolifeRight;
    }

    console.log(panelNolife.find(".title-nolife").width(), panelNolife.find(".author-nolife").width(), right);

    panelNolife.css("transform", "scale(" + ytFrame.width() / 1920 + ")").css("right", ytFrame.width() * right / 1920 + "px");
    if (panelNolifeTop)
    {
      panelNolife.css("transform-origin", "4000px 0px").css("top", parseFloat(ytFrame.css('top')) + ytFrame.height() * 80 / 1080 + "px")
    }
    else
    {
      panelNolife.css("transform-origin", "4000px 60px").css("bottom", parseFloat(ytFrame.css('top')) + ytFrame.height() * 112 / 1080 + "px")
    }
  }
  else
  {
    if (panelNolife.length != 0)
    {
      panelNolife.remove();
    }
  }
}

function logoNolifeTimerEvent()
{
  let logoNolife = $("#logo-nolife");
  if (logoIndex > 0)
  {
    if (logoTimer == undefined)
    {
      logoTimer = setInterval(logoNolifeTimerEvent, 1000);
    }
    const ytFrame = $("#yt-frame");
    if (ytFrame.length == 0)
    {
      return;
    }
    let p1;
    if (API.getMedia() && API.getMedia().duration > 0)
    {
      p1 = API.getTimeElapsed() / API.getMedia().duration;
      if (p1 > 1.0) p1 = 1.0;
    }
    else
    {
      return;
    }
    const p2 = 1.0 - p1;
    if (logoNolife.length == 0)
    {
      logoNolife = $('<svg id="logo-nolife" width="0" height="0" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="pointer-events: none; position: absolute; z-index: 10"><g><g><path d="M0,22 A22,22,0,0,1,22,0 L118,0 A62,62,0,0,1,168,25 A62,62,0,0,1,218,0 L271,0 A62,62,0,0,1,312,16 A22,22,0,0,1,333,0 L382,0 A22,22,0,0,1,404,22 L404,100 L440,100 L440,22 A22,22,0,0,1,462,0 L509,0 A22,22,0,0,1,530,15 A62,26,0,0,1,571,0 L635,0 A37,37,0,0,1,661,12 A62,62,0,0,1,697,0 L767,0 A22,22,0,0,1,789,22 L789,61 A22,22,0,0,1,778,81 L778,105 A22,22,0,0,1,789,124 L789,170 L800,227 A22,22,0,0,1,778,250 L62,250 A62,62,0,0,1,0,188 Z M85,185 L84,185 L101,227 L102,227 L774 215 L757,173 Z" /><path d="" /><path d="M22,31 L116,29 A37,37,0,0,1,153,56 L155,160 L112,161 L110,68 A7,7,0,0,0,102,60 L65,62 L68,178 A7,7,0,0,0,75,185 L85,185 L102,227 L61,228 A37,37,0,0,1,24,192 Z M176,65 A37,37,0,0,1,213,28 L269,27 A37,37,0,0,1,306,64 L307,121 A37,37,0,0,1,270,158 L214,159 A37,37,0,0,1,177,122 Z M227,60 A7,7,0,0,0,220,67 L220 120 A7,7,0,0,0,227,127 L256,126 A7,7,0,0,0,263,119 L262,66 A7,7,0,0,0,255,59 Z M332,26 L375,25 L377,117 A7,7,0,0,0,384,124 L438,123 L439,155 L371,156 A37,37,0,0,1,334,119Z M463,24 L503,23 L505,153 L465,154 Z M530,59 A37,37,0,0,1,567,22 L633,21 L634,52 L580,53 A7,7,0,0,0,573,60 L573,71 L623,70 L624,102 L574,103 L575,152 L531,153Z M656,57 A37,37,0,0,1,693,20 L760,19 L761,50 L706,51 A7,7,0,0,0,699,58 L699,69 L749,68 L750,99 L700,100 L700,111 A7,7,0,0,0,707,118 L761,117 L762,149 L694,150 A37,37,0,0,1,657,113 Z" /></g><g transform="scale(3)"><g><path d="M 21.84375,11.28125 C 16.944888,11.386012 13,15.272829 13,21.6875 L 13,61.5 C 13,67.871 18.129,73 24.5,73 l 7.5,0 0,-8.09375 -2.5,0 c -3.601,0 -6.5,-2.899 -6.5,-6.5 L 23,26.6875 C 23,23.363033 26.065793,22.616877 28.3125,26 L 45.5,51.90625 C 54.510486,65.474365 67,61.87387 67,48 l 0,-36 -10,0 0,31 c 0,3.835577 -3.236752,4.375503 -5.8125,0.6875 L 33.59375,18.5 c -3.559047,-5.095908 -7.939774,-7.300232 -11.75,-7.21875 z" /><path d=""/><path d="M 84.5,22 C 78.129,22 73,27.129 73,33.5 l 0,14 C 73,53.871 78.129,59 84.5,59 l 29,0 c 6.371,0 11.5,-5.129 11.5,-11.5 l 0,-14 C 125,27.129 119.871,22 113.5,22 l -29,0 z m 5,7.90625 19,0 c 3.601,0 6.5,2.899 6.5,6.5 l 0,8 c 0,3.601 -2.899,6.5 -6.5,6.5 l -19,0 c -3.601,0 -6.5,-2.899 -6.5,-6.5 l 0,-8 c 0,-3.601 2.899,-6.5 6.5,-6.5 z"/><path d="m 130.5,22 0,25.5 c 0,6.371 5.129,11.5 11.5,11.5 l 30.5,0 0,-8.09375 -25.5,0 c -3.601,0 -6.5,-2.899 -6.5,-6.5 L 140.5,22 l -10,0 z"/><path d="m 178.5,22 0,37 10,0 0,-37 -10,0 z" /><path d="m 207,22 c -6.371,0 -11.5,5.129 -11.5,11.5 l 0,25.5 10,0 0,-15.09375 32,0 0,-7.90625 -31.96875,0 c 0.21277,-3.406022 3.00727,-6.09375 6.46875,-6.09375 l 25.5,0 L 237.5,22 207,22 z" /><path d="m 255,22 c -6.371,0 -11.5,5.129 -11.5,11.5 l 0,14 c 0,6.371 5.129,11.5 11.5,11.5 l 30.5,0 0,-8.09375 -25.5,0 c -3.601,0 -6.5,-2.899 -6.5,-6.5 l 0,-0.5 32,0 0,-7.90625 -31.96875,0 c 0.21277,-3.406022 3.00727,-6.09375 6.46875,-6.09375 l 25.5,0 L 285.5,22 255,22 z" /></g></g></svg>');
      ytFrame.before(logoNolife);
    }
    let frameWidth = ytFrame.width();
    let frameHeight = frameWidth * 9 / 16;
    let left, top;
    if (frameHeight <= ytFrame.height())
    {
      top = frameHeight * 0.07407407 + (ytFrame.height() - frameHeight) / 2;
      left = frameWidth * 0.09479578;
    }
    else
    {
      frameHeight = ytFrame.height();
      frameWidth = frameHeight * 16 / 9;
      top = frameHeight * 0.07407407;
      left = frameWidth * 0.09479578 + (ytFrame.width() - frameWidth) / 2;
    }
    const width = frameWidth * 0.1281250;
    const height = width / 3.0;
    
    const scale = width / 900.0;

    top += parseFloat(ytFrame.css('top'));

    logoNolife.css('left', Math.floor(left) + 'px').css('top', Math.floor(top) + 'px').attr('width', Math.floor(width)).attr('height', Math.floor(height)).find('g').first().attr('transform', `scale(${scale})`);
    
    if (logoIndex < logoEdges.length)
    {
      const g = logoNolife.find('g g').attr("style", "visibility:hidden").first().attr("style", "visibility:visible");
      const path = g.find('path');
      path.first().attr('style', 'fill:' + logoEdges[logoIndex]);
    path.eq(1).attr('d', `M 85,185 L${757 * p1 + 85 * p2},${173 * p1 + 185 * p2} L${774 * p1 + 102 * p2},${215 * p1 + 227 * p2} L102,227 Z`);
      path.filter(index => index > 0).attr('style', 'fill:' + logoLetters[logoIndex]);
  }
  else
  {
      const g = logoNolife.find('g g').attr("style", "visibility:hidden").last().attr("style", "visibility:visible");
      const path = g.find('path');
      path.filter(index => index < 2).attr('style', 'fill:' + logoOldN[logoIndex - logoEdges.length]);
      path.eq(1).attr('d', `m 31,64.906 0,8.094 ${253.5 * p1},0 0,-8.094 ${-253.5 * p1},0 z`);
      path.filter(index => index > 1).attr('style', 'fill:' + logoOldOLIFE[logoIndex - logoEdges.length]);
    }
  }
  else
  {
    if (logoTimer != undefined)
    {
      clearInterval(logoTimer);
      logoTimer = undefined;
    }
    if (logoNolife.length != 0)
    {
      logoNolife.remove();
    }
  }
}

if (typeof plugDJToolsExtensionUninstall == 'function')
{
  plugDJToolsExtensionUninstall();
}
install();

let uninstall = function ()
{
  console.log(`Uninstalling plug.dj tools v${version}...`);
  if (observerMediaPanel != null)
  {
    observerMediaPanel.disconnect();
    observerMediaPanel = null;
  }
  if (observerPlaylistMenu != null)
  {
    observerPlaylistMenu.disconnect();
    observerPlaylistMenu = null;
  }
  if (observerApp != null)
  {
    observerApp.disconnect();
    observerApp = null;
  }
  if (observerDialogContainer != null)
  {
    observerDialogContainer.disconnect();
    observerDialogContainer = null;
  }

  if (logoTimer != undefined)
  {
    clearInterval(logoTimer);
    logoTimer = undefined;
  }
  if (skipAtTimer != undefined)
  {
     clearTimeout(skipAtTimer);
     skipAtTimer = undefined;
  }
  $("#fullscreen-layer, .playlist-buttons-import-export-tsv, #logo-nolife, #plugdj-tools-extension-css, #playlist-cut-button, #playlist-copy-button, #playlist-paste-button, #playlist-refresh-button, #playlist-sort-button, #playlist-clear-button, #playlist-gears-button, #media-panel .row div.item, #playlist-menu .menu .container .row div.item, .user-logo").remove();
  $(".user-logo-dropdown").parent().remove();
  $(".community__playing-controls").css("pointer-events", "");
  API.off(API.ADVANCE, advance);
}
return uninstall;
})();
