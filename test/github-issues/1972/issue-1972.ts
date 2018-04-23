import "reflect-metadata";
import {createTestingConnections, closeTestingConnections, reloadTestingDatabases} from "../../utils/test-utils";
import {Connection} from "../../../src/connection/Connection";
import {expect} from "chai";

import { User } from "./entity/User";
import { TournamentSquadParticipant } from "./entity/TournamentSquadParticipant";
import { TournamentUserParticipant } from "./entity/TournamentUserParticipant";

describe("github issues > #1972 STI problem - empty columns", () => {
    let connections: Connection[];
    before(async () => connections = await createTestingConnections({
        entities: [__dirname + "/entity/*{.js,.ts}"],
        schemaCreate: true,
        dropSchema: true,
    }));
    beforeEach(() => reloadTestingDatabases(connections));
    after(() => closeTestingConnections(connections));

    it("should insert with userId", () => Promise.all(connections.map(async connection => {
        const user = new User({
            name: "test",
        });
        await connection.manager.save(user);

        const tournamentUserParticipant = new TournamentUserParticipant({ user });
        await connection.manager.save(tournamentUserParticipant);

        const tournamentUserParticipantFromDB = await connection.manager.findOne(TournamentUserParticipant);
        const userRelation = tournamentUserParticipantFromDB && tournamentUserParticipantFromDB.user;

        expect(userRelation).is.not.null;
    })));

    it("should insert with ownerId", () => Promise.all(connections.map(async connection => {
        const user = new User({
            name: "test",
        });
        await connection.manager.save(user);

        const tournamentSquadParticipant = new TournamentSquadParticipant({
            users: [ user ],
            owner: user,
        });
        await connection.manager.save(tournamentSquadParticipant);

        const tournamentSquadParticipantFromDB = await connection.manager.findOne(TournamentSquadParticipant);
        const userRelation = tournamentSquadParticipantFromDB && tournamentSquadParticipantFromDB.owner;

        expect(userRelation).is.not.null;
    })));
});