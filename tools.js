(function() {
let resCancel = "Cancel";

let resClearPlaylist = "Clear playlist"
let resClearName = (name) => `Clear ${name}?`;
let resTypeCodeToClear = (code) => `Type ${code} To Clear`;
let resTypeCode = (code) => `Type ${code}`;

let resGearPlaylist = "Generate playlist"
let resGearName = (name) => `Generate ${name}?`;
let resTypeTracksCountToGenerate = (total) => `Type the number of tracks to generate / ${total}`;
let resTypeTracksCount = "#tracks";

let resMaxByArtist = "Max title by artist (empty = not limited)";
let resTypeMaxByArtist = "#max artist";

let resBeginning = "Add on top";
let resEnd = "Append";
let resOverwrite = "Overwrite playlist";

let observerMediaPanel;
let observerPlaylistMenu;

let logoTitles  = ["None", "Japan", "Other", "Video game", "Indies", "Fiction", "Idols", "J-Music", "Retro Gaming", "Christmas", "Roleplay"];

const logoEdges   = ["#555555", "#FF6E6E", "#AAAAAA", "#96C2D0",    "#FBE170", "#C7A8CA", "#FDBFFB", "#FF6E6E", "#A6C19E",      "#A6C19E",   "#96C2D0"];
const logoLetters = ["#AAAAAA", "#FFFFFF", "#FFFFFF", "#498BC3",    "#F2C10C", "#946BA8", "#FA92F9", "#F20A0E", "#698F5C",      "#F20A0E",   "#FFFFFF"];
const maxPlaylist = 200;

let logoIndex = 0;
let logoTimer;
let clipBoard = { id: null, cut: false, medias: []};

function language_fr()
{
  resCancel = "Annuler";

  resClearPlaylist = "Effacer";
  resClearName = (name) => `Effacer ${name} ?`;
  resTypeCodeToClear = (code) => `Tapez ${code} pour effacer`;
  resTypeCode = (code) => `Tapez ${code}`;

  resGearPlaylist = "Générer"
  resGearName = (name) => `Générer ${name} ?`;
  resTypeTracksCountToGenerate = (total) => `Tapez le nombre de pistes à générer / ${total}`;
  resTypeTracksCount = "Nb pistes";

  resMaxByArtist = "Max titre par artiste (vide = non limité)";
  resTypeMaxByArtist = "Max artist";

  resBeginning = "Ajouter au début";
  resEnd = "Ajouter à la fin";
  resOverwrite = "Ecraser la liste";

  logoTitles  = ["Aucun", "Japon", "Autre", "Jeu vidéo", "Indies", "Fiction", "Idols", "J-Music", "Rétro Gaming", "Noël", "Jeu de rôle"];
}

function createAll()
{
  let language = API.getUser().language;
  if (language == "fr")
  {
    language_fr();
  }
  createCSS();
  createPlaylistButtons();
  createPlaylistsCheckboxes();
  createMediasCheckboxes();
  createUserLogoBouncer();
  createObservers();
  if (logoIndex > 0) logoNolifeTimerEvent();
}

function createCSS()
{
  if ($("#tools-extension-css").length == 0)
  {
    var style = $('<style id="tools-extension-css">#media-panel .row .item { position: relative; height: 55px; width: 30px; margin-right: 0px; cursor: pointer; } #media-panel .row .item.selected i { display: block; } #media-panel .row .item i { top: 17px; left: 5px; display: none; } #playlist-menu .container .item { position: relative; height: 48px; width: 30px; margin-right: 0px; cursor: pointer; } #playlist-menu .container .item.selected i { display: block; } #playlist-menu .container .item i { top: 17px; left: 5px; display: none; } #playlist-panel.playlist--override #playlist-menu .container .row { padding: 0 0 0 0; } #dialog-container #dialog-playlist-delete .dropdown.open #up { display: block; } #dialog-container #dialog-playlist-delete .dropdown #up { display: none; padding: 6px 10px; } #dialog-container #dialog-playlist-delete .dropdown.open #down { display: none; } #dialog-container #dialog-playlist-delete .dropdown #down { display: block; padding: 6px 10px; } @media (min-width: 1344px) and (min-height: 850px) { .community .community__playing-top { min-width: 844px; min-height: 475px; }}</style>');
    $('html > head').append(style);
  }
}

function install()
{
  let playlistMenu = document.getElementById("playlist-menu") != null;
  let mediaPanel = document.getElementById("media-panel") != null;
  let userProfile = false;
  if (playlistMenu && mediaPanel)
  {
    createAll();
  }
  else
  {
    let config = { attributes: false, childList: true, subtree: true };
    let callback = function(mutationsList, observer)
    {
      for(let mutation of mutationsList)
      {
        if (mutation.type == 'childList')
        {
          if (mutation.target.id == "playlist-menu")
          {
            playlistMenu = true;
            mediaPanel = document.getElementById("media-panel") != null;
          }
          else if (mutation.target.id == "media-panel")
          {
            playlistMenu = document.getElementById("playlist-menu") != null;
            mediaPanel = true;
          }
          if (mutation.target.className == "user-profile")
          {
            userProfile = true;
          }
          if (playlistMenu && mediaPanel && userProfile)
          {
            createAll();
            observer.disconnect();
            break;
          }
        }
      }
    };
    let observer = new MutationObserver(callback);
    observer.observe(document.body, config);
  }
}

install();

function createPlaylistButtons()
{
  createGearButton();
  createClearButton();
  createSortButton();
  createRefreshButton();
  createCutCopyPasteButton();
}

function createUserLogoBouncer()
{
  if ($(".user-logo").length == 0)
  {
    let bouncer = $('<div class="user-logo user-profile role-bouncer role-none"><div class="avatar-wrapper thumb small"><div class="background"></div>' + iconNolife(logoIndex, 'style="position: absolute; top: 2px; z-index: 2;"', 24, 20) + '</div></div>');
    bouncer.click(function(event)
    {
      let position = $(this).offset();
      let right = position.left + $(this).width() / 2;
      let bottom = position.top + $(this).height();
      let popover = $(".user-logo-dropdown").parent();
      popover.attr("data-state", "shown").addClass("user-profile-dropdown").css("left", (right - popover.width()) + "px").css("top", (bottom + 20) + "px");
      event.stopPropagation();
    });
    
    $(".user-profile").before(bouncer);
    
    let popover = '<div class="popover" data-state="hidden"><div class="user-logo-dropdown"><ul class="list-unstyled">';
    for(let i = 0; i < logoEdges.length; i++)
    {
      popover += '<li class="user-profile-dropdown__item user-action">' + iconNolife(i, "", 20, 16) + '<span class="user-profile-dropdown__item-text">' + logoTitles[i] + '</span></li>';
    }
    popover += '</ul></div></div>';
    popover = $(popover);
    popover.find('li').click(function()
    {
      logoIndex = $(this).index();
      logoNolifeTimerEvent();
      $(".user-logo svg path").attr('style', 'fill:' + logoLetters[logoIndex]).eq(0).attr('style', 'fill:' + logoEdges[logoIndex]);
    });
    $('.popover').filter(":last").after(popover);
    
    $(document).mousedown(function()
    {
      $(".user-logo-dropdown").parent().attr("data-state", "hidden").removeClass("user-profile-dropdown");
    });
  }
}

function createPlaylistButton(id, fa, click)
{
  if ($(`#playlist-${id}-button`).length == 0)
  {
    let button = $(`<div id="playlist-${id}-button" class="button"><i class="fa fa-${fa}"></i></div>`);
    button.click(click);
    $("#media-panel .playlist-buttons-container .playlist-edit-group").prepend(button);
  }
}

async function gear(playlists, id, initialCount, max, appendMode, maxArtist, checkMyHistory, checkHistory)
{
  cids = await getCids(checkMyHistory, checkHistory);
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
  $("#dialog-container").html(`<div id="dialog-playlist-delete" class="dialog destructive no-submit"><div class="dialog-frame"><span class="title">${resGearPlaylist}</span><i class="icon icon-dialog-close"></i></div><div class="dialog-body"><span class="message">${resGearName(name)}</span><div class="dialog-input-container"><span class="dialog-input-label">${resTypeTracksCountToGenerate(total)}</span><div class="dialog-input-background"><input type="text" maxlength="3" placeholder="${resTypeTracksCount}" name="max-tracks" value=""></div></div><div class="dialog-input-container"><span class="dialog-input-label">${resMaxByArtist}</span><div class="dialog-input-background"><input type="text" maxlength="3" placeholder="${resTypeMaxByArtist}" name="max-by-artist" value=""></div></div><div class="dialog-input-container"><div class="dialog-input-background" style="height: 39px"><dl id="dropdownAppendMode" class="dropdown"><dt><span>Ajouter au début</span><i id="down" class="fa fa-angle-down"></i><i class="fa fa-angle-up" id="up"></i></dt><dd><div class="row selected" data-value="beginning"><span>${resBeginning}</span></div><div class="row" data-value="end"><span>${resEnd}</span></div><div class="row" data-value="overwrite"><span>${resOverwrite}</span></div></dd></dl></div></div></div><div class="dialog-frame"><div class="button cancel"><span>${resCancel}</span></div><div class="button submit"><span>${resGearPlaylist}</span></div></div></div>`).css("display", "block").click(function(event)
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
        //console.log("gear");
        gear(playlists, id, count, parseInt($("#dialog-playlist-delete input[name=max-tracks]").val()), $("#dialog-playlist-delete #dropdownAppendMode dd .row.selected").attr("data-value"), parseInt($("#dialog-playlist-delete input[name=max-by-artist]").val()), true, true);
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
    let maxTracks = parseInt($("#dialog-playlist-delete input[name=max-tracks]").val());
    let maxByArtist = $("#dialog-playlist-delete input[name=max-by-artist]").val();
    if (maxTracks >= 1 && maxTracks <= maxPlaylist && ((maxByArtist == "") || (parseInt(maxTracks) >= 1 && parseInt(maxTracks) <= maxPlaylist)))
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

async function clear(id)
{
  let data = await clearPlaylist(id);
  let count = await data.length;
  await refreshPlaylist(id, count);
}

function clearDialog(id, name)
{
  let code = getRandomInt(900) + 100;
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
    let activePlaylist = getActivePlaylist();
    if (activePlaylist != undefined)
    {
      clearDialog(activePlaylist.attributes.id, activePlaylist.attributes.name);
    }
  });
}

async function sort(id)
{
  let playlist = await fetchPlaylist(id);
  await playlist.sort((element1, element2) => (element1.author == element2.author) ? element1.title.localeCompare(element2.title) : element1.author.localeCompare(element2.author));
  let data = await movePlaylist(id, playlist, -1);
  let count = await data.length;
  await refreshPlaylist(id, count);
}

function createSortButton()
{
  createPlaylistButton("sort", "sort-alpha-asc", function()
  {
    let activePlaylist = getActivePlaylist();
    if (activePlaylist != undefined)
    {
      sort(activePlaylist.attributes.id);
    }
  });
}

function createRefreshButton()
{
  createPlaylistButton("refresh", "refresh", function()
  {
    let activePlaylist = getActivePlaylist();
    if (activePlaylist != undefined)
    {
      refreshPlaylist(activePlaylist.attributes.id);
    }
  });
}

async function paste()
{
  if (clipBoard.id && clipBoard.medias.length > 0)
  {
    let activePlaylist = getActivePlaylist();
    if (activePlaylist != undefined)
    {
      let id = activePlaylist.attributes.id;
      let data = await insertPlaylist(id, clipBoard.medias, false);
      let count = await data[0].count;
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
  clipBoard.id = getActivePlaylist().attributes.id;
  clipBoard.medias = getActivePlaylistMedias().filter(element => element.attributes.checked); //.map(element => {id: element.attributes.id});
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
  let playlists = getPlaylists();
  let rows = $("#playlist-menu .menu .container .row");
  rows.each(function(index, element)
  {
    if ($(element).find("div.item").length == 0)
    {
      let selected = "";
      if (playlists[index].attributes.checked)
      {
        selected = " selected";
      }
      let checkbox = $('<div class="item' + selected + '"><i class="icon icon-check-blue"></i></div>');
      checkbox.click(function(event)
      {
        $(this).toggleClass("selected");
        let index = $(this).parent().index();
        let playlists = getPlaylists();
        playlists[index].attributes.checked = $(this).hasClass("selected");
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
  let medias = getActivePlaylistMedias();
  let rows = $("#media-panel .row");
  let offsetIndex = 0;
  let lastIndex = rows.length - 1;
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
      let mediaIndex = index + offsetIndex;
      if (medias[mediaIndex].attributes.checked)
      {
        checkbox.addClass("selected");
      }
      else
      {
        checkbox.removeClass("selected");
      }
      checkbox.click(function(event)
      {
        $(this).toggleClass("selected");
        let medias = getActivePlaylistMedias();
        medias[mediaIndex].attributes.checked = $(this).hasClass("selected");
        event.stopPropagation();
      }).mouseup(function(event)
      {
        event.stopPropagation();
      }).mousedown(function(event)
      {
        event.stopPropagation();
      });
    }
  });
}

function createObservers()
{
  if (observerMediaPanel == null)
  {
    let mediaPanel = document.getElementById('media-panel');
    let mediaPanelConfig = { attributes: false, childList: true, subtree: true };
    let mediaPanelCallback = function(mutationsList, observer)
    {
      for(let mutation of mutationsList)
      {
        if ((mutation.type == 'childList') && (mutation.target.className == "header no-icon"))
        {
          createPlaylistButtons();
          break;
        }
      }
      for(let mutation of mutationsList)
      {
        if ((mutation.type == 'childList') && (mutation.target.className.startsWith("row playlist-media-item")))
        {
          createMediasCheckboxes();
          break;
        }
      }
    };
    observerMediaPanel = new MutationObserver(mediaPanelCallback);
    observerMediaPanel.observe(mediaPanel, mediaPanelConfig);
  }

  if (observerPlaylistMenu == null)
  {
    let playlistMenu = document.getElementById('playlist-menu');
    let playlistMenuConfig = { attributes: false, childList: true, subtree: true };
    let playlistMenuCallback = function(mutationsList, observer)
    {
      for(let mutation of mutationsList)
      {
        if ((mutation.type == 'childList') && (mutation.target.className == "row"))
        {
          createPlaylistsCheckboxes();
          break;
        }
      }
    };
    observerPlaylistMenu = new MutationObserver(playlistMenuCallback);
    observerPlaylistMenu.observe(playlistMenu, playlistMenuConfig);
  }
}

function uninstall()
{
  observerMediaPanel.disconnect();
  observerPlaylistMenu.disconnect();
}

function refreshPlaylist(id, count)
{
  let rows = $("#playlist-menu .menu .container .row");
  let playlists = getPlaylists();
  if (rows.length == playlists.length)
  {
    let index = playlists.findIndex(element => element.attributes.id == id);
    if (index != -1)
    {
      let row = rows.eq(index);
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
  array.sort(() => Math.random() - 0.5);
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
    let index = getRandomInt(randomIndexes.length);
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
  return author;
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
  let ids = {ids: playlist.map(element => element.id), beforeID: beforeId};
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

async function insertPlaylist(id, playlist, append)
{
  let media = {media: playlist.map(element => element.id), append: append}
  const rawResponse = await fetch('https://plug.dj/_/playlists/' + id +'/media/insert', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(media)
  });
  const content = await rawResponse.json();
  return await content.data;
}

async function deletePlaylist(id, medias)
{
  let ids = {ids: medias.map(element => element.id)};
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
  return await deletePlaylist(id, getActivePlaylistMedias());
}

async function fetchMyHistory()
{
  const response = await fetch('/_/users/me/history');
  const json = await response.json();
  return await json.data;
}

async function getCids(myHistory, history)
{
  let cids = [];
  if (myHistory)
  {
    let data = await fetchMyHistory();
    cids = await data.map(element => element.media.cid);
  }
  
  if (history)
  {
    cids = await cids.concat(API.getHistory().map(element => element.media.cid));
  }
  return await cids;
}

function getActivePlaylistMedias()
{
  return _.find(require.s.contexts._.defined, m => m && m instanceof Backbone.Collection && m._events && m._events["change:author"]).models;
}

function getPlaylists()
{
  return _.find(require.s.contexts._.defined, m => m && m instanceof Backbone.Collection && typeof m.jumpToMedia === 'function').models;
}

function getActivePlaylist()
{
  return  getPlaylists().find(element => element.attributes.visible == true);
}

function iconNolife(logoIndex, style, width, height)
{
  return `<svg width="${width}" height="${height}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ${style}><g transform="scale(${width / 320.0})"><path style="fill:${logoEdges[logoIndex]}" d="M0,22 A22,22,0,0,1,22,0 L118,0 A62,62,0,0,1,168,25 A22,22,0,0,1,190,0 L239,0 A22,22,0,0,1,261,22L261,100 L298,100 A22,22,0,0,1,319,124 L319,170 L320,227 A22,22,0,0,1,298,250 L62,250 A62,62,0,0,1,0,188 Z M85,185 L84,185 L101,227 L102,227 L304 215 L287,173 Z"></path><path style="fill:${logoLetters[logoIndex]};" d="M 85,185 L287,173 L304 215 L102,227 Z M22,31 L116,29 A37,37,0,0,1,153,56 L155,160 L112,161 L110,68 A7,7,0,0,0,102,60 L65,62 L68,178 A7,7,0,0,0,75,185 L85,185 L102,227 L61,228 A37,37,0,0,1,24,192 Z M189,26 L232,25 L234,117 A7,7,0,0,0,241,124 L295,123 L296,155 L228,156 A37,37,0,0,1,192,119Z"></path></g></svg>`;
}

function logoNolifeTimerEvent()
{
  let logoNolife = $("#logo-nolife");
  if (logoIndex > 0)
  {
    if(logoTimer == undefined)
    {
      logoTimer = setInterval(logoNolifeTimerEvent, 1000);
    }
    let ytFrame = $("#yt-frame");
    if (ytFrame.length == 0)
    {
      return;
    }
    let p1;
    if (API.getMedia() && API.getMedia().duration > 0)
    {
      p1 = API.getTimeElapsed() / API.getMedia().duration;
    }
    else
    {
      return;
    }
    let p2 = 1.0 - p1;
    if (logoNolife.length == 0)
    {
      ytFrame.before('<svg id="logo-nolife" width="0" height="0" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="position: absolute; z-index: 10"><g><path d="M0,22 A22,22,0,0,1,22,0 L118,0 A62,62,0,0,1,168,25 A62,62,0,0,1,218,0 L271,0 A62,62,0,0,1,312,16 A22,22,0,0,1,333,0 L382,0 A22,22,0,0,1,404,22 L404,100 L440,100 L440,22 A22,22,0,0,1,462,0 L509,0 A22,22,0,0,1,530,15 A62,26,0,0,1,571,0 L635,0 A37,37,0,0,1,661,12 A62,62,0,0,1,697,0 L767,0 A22,22,0,0,1,789,22 L789,61 A22,22,0,0,1,778,81 L778,105 A22,22,0,0,1,789,124 L789,170 L800,227 A22,22,0,0,1,778,250 L62,250 A62,62,0,0,1,0,188 Z M85,185 L84,185 L101,227 L102,227 L774 215 L757,173 Z"></path><path d=""></path><path d="M22,31 L116,29 A37,37,0,0,1,153,56 L155,160 L112,161 L110,68 A7,7,0,0,0,102,60 L65,62 L68,178 A7,7,0,0,0,75,185 L85,185 L102,227 L61,228 A37,37,0,0,1,24,192 Z M176,65 A37,37,0,0,1,213,28 L269,27 A37,37,0,0,1,306,64 L307,121 A37,37,0,0,1,270,158 L214,159 A37,37,0,0,1,177,122 Z M227,60 A7,7,0,0,0,220,67 L220 120 A7,7,0,0,0,227,127 L256,126 A7,7,0,0,0,263,119 L262,66 A7,7,0,0,0,255,59 Z M332,26 L375,25 L377,117 A7,7,0,0,0,384,124 L438,123 L439,155 L371,156 A37,37,0,0,1,334,119Z M463,24 L503,23 L505,153 L465,154 Z M530,59 A37,37,0,0,1,567,22 L633,21 L634,52 L580,53 A7,7,0,0,0,573,60 L573,71 L623,70 L624,102 L574,103 L575,152 L531,153Z M656,57 A37,37,0,0,1,693,20 L760,19 L761,50 L706,51 A7,7,0,0,0,699,58 L699,69 L749,68 L750,99 L700,100 L700,111 A7,7,0,0,0,707,118 L761,117 L762,149 L694,150 A37,37,0,0,1,657,113 Z"></path></g></svg>');
    }
    let frameWidth = ytFrame.width();
    let frameHeight = frameWidth * 9 / 16;
    let left, top;
    if (frameHeight <= ytFrame.height())
    {
      top = frameHeight * 0.07407407 + (ytFrame.height() - frameHeight) / 2;
      left = frameWidth * 0.0885416;
    }
    else
    {
      frameHeight = ytFrame.height();
      frameWidth = frameHeight * 16 / 9;
      top = frameHeight * 0.07407407;
      left = frameWidth * 0.0885416 + (ytFrame.width() - frameWidth) / 2;
    }
    let width = frameWidth * 0.1281250;
    let height = width / 3.0;
    
    let scale = width / 900.0;
    
    logoNolife.attr('width', Math.floor(width));
    logoNolife.attr('height', Math.floor(height));
    logoNolife.find('g').attr('transform', `scale(${scale})`);
    logoNolife.css('left', Math.floor(left) + 'px').css('top', Math.floor(top) + 'px');
    let path = logoNolife.find('path');
    path.first().attr('style', 'fill:' + logoEdges[logoIndex]).attr("fill-opacity", "0.4");
    path.eq(1).attr('d', `M 85,185 L${757 * p1 + 85 * p2},${173 * p1 + 185 * p2} L${774 * p1 + 102 * p2},${215 * p1 + 227 * p2} L102,227 Z`);
    path.filter(index => index > 0).attr('style', 'fill:' + logoLetters[logoIndex]).attr("fill-opacity", "0.9");

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
})();
