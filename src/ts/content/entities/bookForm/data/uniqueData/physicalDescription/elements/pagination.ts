const pagination = (n: number, showSubtract: boolean, showAdd: boolean) => `
<fieldset id="fs_u_pag_${n}">
	<input type="hidden" name="type" value="pages">
	<input type="hidden" name="deleted" value="">
	<input type="hidden" id="forcesave_" name="forcesave_pages" value="0">
	<input type="hidden" name="id" value="fs_u_pag_${n}">
	<input style="width:50px;margin-right:5px;" id="" name="pagecount" class="bookEditInput" value="" onkeyup="handleAutogenChange('');">
	<select style="width:auto;" name="pagetype" class="bookEditInput">
		<option value="0" selected="">1,2,3,...</option>
		<option value="1">i,ii,iii,...</option>
		<option value="3">a,b,c,...</option>
		<option value="4">other</option>
		<option value="2">unpaged</option>
		<option value="5">total pages</option>
		<option value="6"></option>
		<option value="7"></option>
	</select>
	<a href="#" id="arbm_fs_u_pag_${n}" style="${
	showSubtract === false ? "display:none;" : ""
}" class="rowPlusMinus" onclick="book_deleteUIRow('fs_u_pag_${n}');return false;">–</a>
	<a href="#" id="arb_fs_u_pag_${n}" style="${
	showAdd === false ? "display:none;" : ""
}" class="rowPlusMinus" onclick="book_addUIRow('pages', 'fs_u_pag_${n}');return false;">+</a>
</fieldset>
`;

export {pagination};
