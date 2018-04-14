/* GComprisServer - MessageHandler.h
 *
 * Copyright (C) 2016 Johnny Jazeix <jazeix@gmail.com>
 *
 * Authors:
 *   Johnny Jazeix <jazeix@gmail.com>
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
 */
#ifndef MESSAGEHANDLER_H
#define MESSAGEHANDLER_H

#include "Messages.h"
#include "ClientData.h"
#include "GroupData.h"
#include "UserData.h"
#include <QObject>
#include <QtQml>

class Authentication;

/**
 * @class MessageHandler
 * @short Handles all the messages received by the socket
 *
 * JOB:
 * -Handle messages received by the socket
 * -Create, update, delete information about:
 *  --users
 *  --groups
 * -Linking users, clients and groups with each other
 *
 *
 * @sa UserData
 * @sa GroupData
 * @sa ClientData
 */
class MessageHandler: public QObject
{
    Q_OBJECT

    Q_PROPERTY(QList<QObject*> clients MEMBER m_clients NOTIFY newClients)
    Q_PROPERTY(QList<QObject*> groups MEMBER m_groups NOTIFY newGroups)
    Q_PROPERTY(QList<QObject*> users MEMBER m_users NOTIFY newUsers)

private:
    MessageHandler();  // prohibit external creation, we are a singleton!
    static MessageHandler* _instance;  // singleton instance
    
public:
    /**
     * Registers MessageHandler singleton in the QML engine.
     */
    static void init();
    static QObject *systeminfoProvider(QQmlEngine *engine,
            QJSEngine *scriptEngine);
    static MessageHandler* getInstance();

    Q_INVOKABLE void createGroup(const QString &groupName,
                                       const QString &description = QString(),
                                       const QStringList &users = QStringList());
    Q_INVOKABLE void updateGroup(const QString &oldGroup,
                                       const QString &groupName,
                                       const QString &description = QString(),
                                       const QStringList& users = QStringList());
    Q_INVOKABLE void deleteGroup(const QString &groupName);

    Q_INVOKABLE void createUser(const QString &userName, const QString &age, const QString &avatar = QString(), const QStringList &groups = QStringList());
    Q_INVOKABLE void updateUser(const QString &oldUser, const QString &newUser, const QString &avatar = QString(), const QStringList &groups = QStringList());
    Q_INVOKABLE void deleteUser(const QString &userName);

    Q_INVOKABLE void addUserToGroup(const QStringList& groups, const QStringList& users);

    Q_INVOKABLE UserData *getUser(const QString &userName);
    Q_INVOKABLE GroupData *getGroup(const QString &groupName);

    Q_INVOKABLE QList<QObject*> returnGroupUsers(const QString& group) {
        GroupData* g = getGroup(group);
        if(g) {
            return g->getUsers();
        }
    }

    QList<QObject*> returnUsers() {
        return m_users;
    }

    /*QList<QObject*> returnClients() {
        return m_clients;
    }*/



public slots:
    void onLoginReceived(QTcpSocket* socket, const Login &data);
    void onActivityDataReceived(QTcpSocket* socket, const ActivityRawData &act);
    void onNewClientReceived(QTcpSocket* socket);
    void onClientDisconnected(QTcpSocket* socket);

signals:
    void newClients();
    void newGroups();
    void newUsers();
    void newActivityData();

private:
    ClientData *getClientData(QTcpSocket* socket);

    void removeUserFromAllGroups(UserData *user);

    // ClientData*
    QList<QObject*> m_clients;
    // GroupData*
    QList<QObject*> m_groups;
    // UserData*
    QList<QObject*> m_users;

    Authentication* m_auth;
};

#endif
