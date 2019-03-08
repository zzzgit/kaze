import AssertFuncAsync from "./AssertFuncAsync"
import AssertFuncSync from "./AssertFuncSync"

type AssertFunc = AssertFuncAsync | AssertFuncSync

export default AssertFunc
