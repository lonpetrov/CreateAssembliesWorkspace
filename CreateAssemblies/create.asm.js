function createAsm(name) {
	if (debugMode) {
		let msg = 'Cîçäàí îáúåêò: ';
		Debugging(msg + name, "#FF0000");
    }
	this.models = [];

}

createAsm.prototype.Cascade = function () {

	if (pfcIsMozilla())
		netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
	Debugging("begin");

	//Creating weblink objects-->
	let TypeClass = pfcCreate("pfcModelType");
	let CheckoutOptions = pfcCreate("pfcCheckoutOptions");
	let ModelDescriptor = pfcCreate("pfcModelDescriptor");
	let listToDelete = pfcCreate("stringseq");

	//Creating variables
	let nameOfModel = "sh-10.prt";
	let numberOfOrder = "M1999";
	let lengthOfSH = 1000



	//Action -->
	let session = pfcGetProESession();
	let server = session.GetActiveServer();
	let options = CheckoutOptions.Create();
	options.Download = true;

	let checkoutModel = server.CheckoutObjects(null, nameOfModel, false, options);
	Debugging(checkoutModel);

	let thisModelDescr = ModelDescriptor.CreateFromFileName(nameOfModel);
	Debugging(thisModelDescr.GetFullName());

	let retrivedModel = session.RetrieveModel(thisModelDescr)
	Debugging(retrivedModel.FileName);

	let newNameOfModel = numberOfOrder + '_' + retrivedModel.InstanceName + '_' + lengthOfSH;
	Debugging(newNameOfModel);

	let copiedModel = retrivedModel.CopyAndRetrieve(newNameOfModel, null);
	Debugging(copiedModel.FileName);

	let listRowsOfModel = copiedModel.ListRows();
	Debugging(listRowsOfModel.Count);
	for (let i = 0; i < listRowsOfModel.Count; i++) {
		Debugging(listRowsOfModel.Item(i).InstanceName);
		copiedModel.RemoveRow(listRowsOfModel.Item(i))
		Debugging(listRowsOfModel.Item(i).InstanceName + '+');
		listToDelete.Append("wtws://Windchill/M1017/" + listRowsOfModel.Item(i).InstanceName.toLowerCase() + ".prt"); // + ".prt"
		Debugging(listToDelete.Item(i));
    }

	Debugging(listToDelete.Count);
	//Debugging(session.GetCurrentWS());

	server.RemoveObjects(listToDelete);







	//if (assembly == void null || assembly.Type != modelTypeClass.MDL_ASSEMBLY) {
	//	throw new Error(0, "Current model is not an assembly.");
	//}

	Debugging("end");
}

createAsm.prototype.RemoveObjectsFromWS = function () {
	let session = pfcGetProESession();
	let server = session.GetActiveServer();
	server.RemoveObjects(null);
}


//get all items that have to be changed (materials, parts, assemlbies)
createAsm.prototype.GetFlexSpecItems = function (list) {
	paramValueType = pfcCreate("pfcParamValueType");
	let specItems = [];
	for (var i = 0; i < list.length; i++) {
		let value = list[i].GetParam("ÐÀÇÄÅË_ÑÏÅÖ").GetScaledValue();
		if ((value.discr === paramValueType.PARAM_STRING)) {
			if (value.StringValue === "ÄÅÒÀËÈ" || value.StringValue === "ÌÀÒÅÐÈÀËÛ" || value.StringValue === "ÑÁÎÐÎ×ÍÛÅ ÅÄÈÍÈÖÛ") {
				//Debugging(list[i].InstanceName + " - " + value.StringValue);
				specItems.push(list[i]);
			}
		}
	}
	return specItems;
}

//Gets Unique Models
createAsm.prototype.GetUniqueModels = function (list) {
	let result = [];
	for (let i = 0; i < list.length; i++) {
		if (result.indexOf(list[i]) === -1) {
			result.push(list[i]);
		}
	}
	return result;
}

//Deletes retrieved models from collecton
createAsm.prototype.FlushRetrievedModels = function () {
	this.models = [];
}

//gets two lists of active! models
createAsm.prototype.GetTreeCascade = function (assembly, session) {
	var self = this;
	var modelTypeClass = pfcCreate("pfcModelType");
	var featureStatus = pfcCreate("pfcFeatureStatus");
	var components = assembly.ListFeaturesByType(false, pfcCreate("pfcFeatureType").FEATTYPE_COMPONENT);

	for (var i = 0; i < components.Count; i++) {
		var component = components.Item(i);//pfcFeature
		var desc = component.ModelDescr;
		let status = component.Status;

		if (desc.Type == modelTypeClass.MDL_ASSEMBLY && status == featureStatus.FEAT_ACTIVE) {
			var assemblyModel = session.GetModelFromDescr(desc);
			//Debugging('Asm: ' + assemblyModel.Type + ' ' + assemblyModel.InstanceName + ' ' + status);
			this.models.push(assemblyModel);
			self.GetTreeCascade(assemblyModel, session);
		}
		else if (desc.Type == modelTypeClass.MDL_PART && status == featureStatus.FEAT_ACTIVE) {
			var partModel = session.GetModelFromDescr(desc);
			//Debugging('Part: ' + partModel.Type + ' ' + partModel.InstanceName + ' ' + status);
			this.models.push(partModel);
		}

	}
}

//Adds rows to family table
createAsm.prototype.AddNewRow = function (partModel, name) {
	var nameOfInst = "new_inst";
	try {
		var newInstanceOfPartModel = partModel.AddRow(nameOfInst, null);
	}
	catch (err) {

		var error = pfcGetExceptionType(err);
		if (error == "pfcXToolkitFound") {
			alert('U: ' + error);
			/* counter++;
			nameOfInst = nameOfInst +'-'+counter;  
			var newInstanceOfPartModel = partModel.AddRow(nameOfInst, null); */
		}
	}
	//alert(newInstanceOfPartModel.InstanceName);
}

//Makes list from Models
createAsm.prototype.MakeListFromModels = function (models) {
	let out = [];
	for (let i = 0; i < models.Count; i++) {
		out.push(models.Item(i));
	}
	return out;
}

//Gets list of InstanceName of Parts
createAsm.prototype.GetInstanceNames = function (list) {
	let result = [];
	for (let i = 0; i < list.length; i++) {
		result.push(list[i].InstanceName);
	}
	return result;
}