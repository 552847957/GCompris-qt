/* GCompris - Resistor.qml
 *
 * Copyright (C) 2020 Aiswarya Kaitheri Kandoth <aiswaryakk29@gmail.com>
 *
 * Authors:
 *   Bruno Coudoin <bruno.coudoin@gcompris.net> (GTK+ version)
 *   Aiswarya Kaitheri Kandoth <aiswaryakk29@gmail.com> (Qt Quick port)
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
 *   along with this program; if not, see <https://www.gnu.org/licenses/>.
 */
import QtQuick 2.6
import GCompris 1.0
import "../analog_electricity.js" as Activity

ElectricalComponent {
    id: resistor
    terminalSize: 0.2
    noOfConnectionPoints: 2
    information: qsTr("It implements resistance in an electrical circuit.")
    labelText1: "V = " + componentVoltage + "V"
    labelText2: "I = " + resistorCurrent + "A"
    source: Activity.url + "resistor.png"

 property var nodeVoltages: [0, 0]
    property double componentVoltage: 0
    property double resistorCurrent: 0
    property alias connectionPoints: connectionPoints
    property alias aMeter1: aMeter1
    property alias aMeter2: aMeter2
    property var connectionPointPosX: [0, 1]
    property var connectionPointPosY: [0.5, 0.5]
    property string componentName: "Resistor"
    property var internalNetlistIndex: [0, 0]
    property var externalNetlistIndex: [0, 0]
    property var netlistModel:
    [
        "r",
        [
        ],
        {
            "name": componentName,
            "r": "1000",
            "_json_": 0
        },
        [
            0,
            0
        ]
    ]

    Item {
        id: aMeter1
        property int jsonNumber: 0
        property double current: 0
        property var netlistModel:
        [
            "a",
            [
            ],
            {
                "name": "aMeter1-",
                "color": "magenta",
                "offset": "0",
                "_json_": aMeter1.jsonNumber
            },
            [
                0,
                0
            ]
        ]
    }

    Item {
        id: aMeter2
        property int jsonNumber: 0
        property double current: 0
        property var netlistModel:
        [
            "a",
            [
            ],
            {
                "name": "aMeter2-",
                "color": "magenta",
                "offset": "0",
                "_json_": aMeter2.jsonNumber
            },
            [
                0,
                0
            ]
        ]
    }

    Repeater {
        id: connectionPoints
        model: 2
        delegate: connectionPoint
        Component {
            id: connectionPoint
            TerminalPoint {
                posX: connectionPointPosX[index]
                posY: connectionPointPosY[index]
            }
        }
    }

    function checkConnections() {
        var terminalConnected = 0;
        for(var i = 0; i < noOfConnectionPoints; i++) {
            if(connectionPoints.itemAt(i).wires.length > 0)
                terminalConnected += 1;
        }
        if(terminalConnected >= 2) {
            resistor.showLabel = true;
        } else {
            resistor.showLabel = false;
        }
    }

    function updateValues() {
        resistorCurrent = (Math.abs(aMeter1.current)).toFixed(3);
        componentVoltage = (Math.abs(nodeVoltages[1] - nodeVoltages[0])).toFixed(2);
    }

    function initConnections() {
        var connectionIndex = Activity.connectionCount;
        resistor.externalNetlistIndex[0] = ++connectionIndex;
        connectionPoints.itemAt(0).updateNetlistIndex(connectionIndex);
        resistor.internalNetlistIndex[0] = ++connectionIndex;
        resistor.internalNetlistIndex[1] = ++connectionIndex;
        resistor.externalNetlistIndex[1] = ++connectionIndex;
        connectionPoints.itemAt(1).updateNetlistIndex(connectionIndex);
        Activity.connectionCount = connectionIndex;
    }

    function addToNetlist() {
        var netlistItem = aMeter1.netlistModel;
        Activity.netlistComponents.push(aMeter1);
        Activity.vSourcesList.push(aMeter1);
        netlistItem[2].name = "aMeter1-" + componentName;
        netlistItem[2]._json = Activity.netlist.length;
        netlistItem[3][0] = resistor.externalNetlistIndex[0];
        netlistItem[3][1] = resistor.internalNetlistIndex[0];
        Activity.netlist.push(netlistItem);

        netlistItem = resistor.netlistModel;
        Activity.netlistComponents.push(resistor);
        netlistItem[2].name = componentName;
        netlistItem[2]._json = Activity.netlist.length;
        netlistItem[3][0] = resistor.internalNetlistIndex[0];
        netlistItem[3][1] = resistor.internalNetlistIndex[1];
        Activity.netlist.push(netlistItem);

        netlistItem = aMeter2.netlistModel;
        Activity.netlistComponents.push(aMeter2);
        Activity.vSourcesList.push(aMeter2);
        netlistItem[2].name = "aMeter2-" + componentName;
        netlistItem[2]._json = Activity.netlist.length;
        netlistItem[3][0] = resistor.internalNetlistIndex[1];
        netlistItem[3][1] = resistor.externalNetlistIndex[1];
        Activity.netlist.push(netlistItem);
    }
}
