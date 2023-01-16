const weight = (n: number, showSubtract: boolean, showAdd: boolean) => `
<fieldset id="fs_u_wgt_${n}">
	<input type="hidden" name="type" value="weight">
	<input type="hidden" name="deleted" value="">
	<input type="hidden" id="forcesave_" name="forcesave_weight" value="0">
	<input type="hidden" name="id" value="fs_u_wgt_${n}">
	<input style="width:50px;margin-right:5px;" id="" name="weight" value="" class="bookEditInput" onkeyup="handleAutogenChange('');">
	<select style="width:auto;" name="unit" phystag="unit" class="bookEditInput">
		<option value="0" selected="">pounds</option>
		<option value="1">kg</option>
	</select>
	<a href="#" id="arbm_fs_u_wgt_${n}" style="${
	showSubtract === false ? "display:none;" : ""
}" class="rowPlusMinus" onclick="book_deleteUIRow('fs_u_wgt_${n}');return false;">–</a>
	<a href="#" id="arb_fs_u_wgt_${n}" style="${
	showAdd === false ? "display:none;" : ""
}" class="rowPlusMinus" onclick="book_addUIRow('weight', 'fs_u_wgt_${n}');return false;">+</a>
</fieldset>
`;

export {weight};
