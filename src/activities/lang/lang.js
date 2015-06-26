/* GCompris - lang.js
 *
 * Copyright (C) 2014 Siddhesh suthar<siddhesh.it@gmail.com>
 *
 * Authors:
 *   Pascal Georges (pascal.georges1@free.fr) (GTK+ version)
 *   Siddhesh suthar <siddhesh.it@gmail.com> (Qt Quick port)
 *   Bruno Coudoin <bruno.coudoin@gcompris.net> (Integration Lang dataset)
 *
 *   This program is free software; you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation; either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program; if not, see <http://www.gnu.org/licenses/>.
 */.pragma library
.import QtQuick 2.0 as Quick
.import GCompris 1.0 as GCompris
.import "qrc:/gcompris/src/core/core.js" as Core
.import "qrc:/gcompris/src/activities/lang/lang_api.js" as Lang
.import "qrc:/gcompris/src/activities/lang/quiz.js" as QuizActivity
.import "qrc:/gcompris/src/activities/lang/spell_it.js" as SpellActivity

var currentLevel = 0;
var currentSubLevel = 0;
var level = null;
var maxLevel;
var maxSubLevel;
var items;
var baseUrl = "qrc:/gcompris/src/activities/lang/resource/";
var dataset = null;
var lessons
var menus
var wordList
var savedWordList
var subLevelsLeft
var currentProgress = []
var savedProgress = []
var modifiedWordCount = 0
// miniGames is list of miniGames
// first element is Activity name,
// second element is mode of miniGame
// third element is the qml to load
var miniGames = [["QuizActivity", 1,"Quiz.qml"],
                 ["QuizActivity", 2,"Quiz.qml"],
                 ["QuizActivity", 3,"Quiz.qml"],
                 ["SpellActivity", 1,"SpellIt.qml"]];
var currentMiniGame
var loadedItems

function init(items_) {
    items = items_
    maxLevel = 0
    maxSubLevel = 0
    currentLevel = 0
    currentSubLevel = 0
}

function start() {
    currentLevel = 0;
    currentSubLevel = 0;

    var locale = items.locale == "system" ? "$LOCALE" : items.locale
    dataset = Lang.load(items.parser, baseUrl, "words.json", "content-"+ locale +".json")

    // If dataset is empty, we try to load from short locale and if not present again, we switch to default one
    var localeUnderscoreIndex = locale.indexOf('_')
    if(!dataset) {
        var localeShort;
        // We will first look again for locale xx (without _XX if exist)
        if(localeUnderscoreIndex > 0) {
            localeShort = locale.substring(0, localeUnderscoreIndex)
        }
        else {
            localeShort = locale;
        }
        dataset = Lang.load(items.parser, baseUrl, "words.json", "content-"+localeShort+ ".json")
    }

    //If still dataset is empty then fallback to english
    if(!dataset) {
        // English fallback
        items.background.englishFallback = true
        dataset = Lang.load(items.parser, baseUrl, "words.json", "content-en.json")
    } else {
        items.background.englishFallback = false
    }

    lessons = Lang.getAllLessons(dataset)
    maxLevel = lessons.length

    menus = Lang.getMenuModel(dataset, items)
    items.menuModel.clear()

    for (var j =0; j<maxLevel; j++) {
        if(!(currentProgress[j] > 0))
            currentProgress[j] = 0
    }
    for (var k =0; k<maxLevel; k++) {
        if(!(savedProgress[k] > 0))
            savedProgress[k] = 0
    }

    items.menuModel.clear()
    items.menuModel.append(menus)

    items.imageFrame.visible = false
    items.score.visible = false

    items.menu_screen.visible = true
    items.menu_screen.focus = true
    items.menu_screen.forceActiveFocus()

    //    initLevel();

}

function stop() {

}

function initLevel(currentLevel_) {
    currentLevel = currentLevel_
    items.bar.level = currentLevel + 1;

    var currentLesson = lessons[currentLevel]
    wordList = Lang.getLessonWords(dataset, currentLesson);

    Core.shuffle(wordList);

    maxSubLevel = wordList.length;
    items.score.numberOfSubLevels = maxSubLevel;
    items.score.currentSubLevel = 1;
    items.score.visible = true

    items.menu_screen.visible = false
    items.imageFrame.visible = true

    items.wordTextbg.visible = true
    items.wordText.visible = true
    items.categoryTextbg.visible = true
    items.categoryText.changeCategory(currentLesson.name);
    items.miniGameLoader.source = ""
    items.keyboard.visibleFlag = false
    currentMiniGame = 0
    currentProgress[currentLevel] = 0

    subLevelsLeft = [];
    for(var i in wordList) {
        subLevelsLeft.push(i)   // This is available in all editors.
    }

    initSubLevel()
}

function initSubLevel() {
    // initialize sublevel
    if(items.score.currentSubLevel == 1)
        items.previousWordButton.visible = false
    else
        items.previousWordButton.visible = true

    items.goodWord = wordList[items.score.currentSubLevel-1]
    items.wordImage.changeSource("qrc:/gcompris/data/" + items.goodWord.image)
    items.wordText.changeText(items.goodWord.translatedTxt)
}

function nextLevel() {
    if(savedProgress[currentLevel] < currentProgress[currentLevel])
        savedProgress[currentLevel] = currentProgress[currentLevel]
    console.log("clicked on next and saved "+ savedProgress[currentLevel])

    if(maxLevel <= ++currentLevel ) {
        currentLevel = 0
    }
    initLevel(currentLevel);
}

function previousLevel() {
    if(savedProgress[currentLevel] < currentProgress[currentLevel])
        savedProgress[currentLevel] = currentProgress[currentLevel]
    console.log("clicked on prev and saved "+ savedProgress[currentLevel])

    if(--currentLevel < 0) {
        currentLevel = maxLevel - 1
    }
    initLevel(currentLevel);
}

function nextSubLevel() {
    ++items.score.currentSubLevel;
    ++currentProgress[currentLevel]
    //make a change when progress exceedes previous one 2 0

    if(items.score.currentSubLevel == items.score.numberOfSubLevels+1) {
        // saving progress after completion
        savedProgress[currentLevel] = currentProgress[currentLevel]
        //here logic for starting quiz game
        nextMiniGame()
    }
    else {
        initSubLevel();
    }
}

function prevSubLevel() {
    --items.score.currentSubLevel
    --currentProgress[currentLevel]
    if( items.score.currentSubLevel <= 0) {
        //Do nothing
    }
    else {
        initSubLevel()
    }
}

//called by a miniGame when it is won
function nextMiniGame() {
    if(currentMiniGame < miniGames.length) {

        var mode = miniGames[currentMiniGame][1];
        var itemToLoad = miniGames[currentMiniGame][2];

        // reloading the wordList
        var currentLesson = lessons[currentLevel]
        var wordList = Lang.getLessonWords(dataset, currentLesson);
        Core.shuffle(wordList);
        maxSubLevel = wordList.length

        items.miniGameLoader.source = itemToLoad;
        loadedItems = items.miniGameLoader.item

        // resetting the wordList length because it could have been spliced by quiz miniGame 3
        if(currentMiniGame === 3) {
            items.score.numberOfSubLevels = wordList.length
        }

        // initiate the loaded item mini game
        loadedItems.init(items, loadedItems, wordList, mode)
        ++currentMiniGame;
    }
    else {
        nextLevel()
    }
}

function getProgressStatus(index) {
    return savedProgress[index  ]
}
