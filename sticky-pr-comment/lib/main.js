"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const config_1 = require("./config");
const comment_1 = require("./comment");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        if (isNaN(config_1.pullRequestNumber) || config_1.pullRequestNumber < 1) {
            core.info("no pull request numbers given: skip step");
            return;
        }
        try {
            const body = yield (0, config_1.getBody)();
            if (!body && config_1.ignoreEmpty) {
                core.info("no body given: skip step by ignoreEmpty");
                return;
            }
            if (!config_1.deleteOldComment && !config_1.hideOldComment && !body) {
                throw new Error("Either message or path input is required");
            }
            if (config_1.deleteOldComment && config_1.recreate) {
                throw new Error("delete and recreate cannot be both set to true");
            }
            if (config_1.onlyCreateComment && config_1.onlyUpdateComment) {
                throw new Error("only_create and only_update cannot be both set to true");
            }
            if (config_1.hideOldComment && config_1.hideAndRecreate) {
                throw new Error("hide and hide_and_recreate cannot be both set to true");
            }
            const octokit = github.getOctokit(config_1.githubToken);
            const previous = yield (0, comment_1.findPreviousComment)(octokit, config_1.repo, config_1.pullRequestNumber, config_1.header);
            core.setOutput("previous_comment_id", previous === null || previous === void 0 ? void 0 : previous.id);
            if (config_1.deleteOldComment) {
                if (previous) {
                    yield (0, comment_1.deleteComment)(octokit, previous.id);
                }
                return;
            }
            if (!previous) {
                if (config_1.onlyUpdateComment) {
                    return;
                }
                const created = yield (0, comment_1.createComment)(octokit, config_1.repo, config_1.pullRequestNumber, body, config_1.header);
                core.setOutput("created_comment_id", created === null || created === void 0 ? void 0 : created.data.id);
                return;
            }
            if (config_1.onlyCreateComment) {
                // don't comment anything, user specified only_create and there is an
                // existing comment, so this is probably a placeholder / introduction one.
                return;
            }
            if (config_1.hideOldComment) {
                yield (0, comment_1.minimizeComment)(octokit, previous.id, config_1.hideClassify);
                return;
            }
            if (config_1.skipUnchanged && (0, comment_1.commentsEqual)(body, previous.body, config_1.header)) {
                // don't recreate or update if the message is unchanged
                return;
            }
            const previousBody = (0, comment_1.getBodyOf)(previous, config_1.append, config_1.hideDetails);
            if (config_1.recreate) {
                yield (0, comment_1.deleteComment)(octokit, previous.id);
                const created = yield (0, comment_1.createComment)(octokit, config_1.repo, config_1.pullRequestNumber, body, config_1.header, previousBody);
                core.setOutput("created_comment_id", created === null || created === void 0 ? void 0 : created.data.id);
                return;
            }
            if (config_1.hideAndRecreate) {
                yield (0, comment_1.minimizeComment)(octokit, previous.id, config_1.hideClassify);
                const created = yield (0, comment_1.createComment)(octokit, config_1.repo, config_1.pullRequestNumber, body, config_1.header);
                core.setOutput("created_comment_id", created === null || created === void 0 ? void 0 : created.data.id);
                return;
            }
            yield (0, comment_1.updateComment)(octokit, previous.id, body, config_1.header, previousBody);
        }
        catch (error) {
            if (error instanceof Error) {
                core.setFailed(error.message);
            }
        }
    });
}
run();
