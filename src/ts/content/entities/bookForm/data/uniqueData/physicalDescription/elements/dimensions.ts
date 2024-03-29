const dimensions = (n: number, showAdd: boolean) => `
<fieldset id="fs_u_dim_${n}">
	<input type="hidden" name="type" value="dims">
	<input type="hidden" name="deleted" value="">
	<table class="physTypesTable dimset" cellpadding="0" cellspacing="0">
		<tbody>
			<tr>
				<input type="hidden" name="id" value="fs_u_dim_${n}">
				<input type="hidden" id="forcesave_pdh_fs_u_dim_${n}" name="forcesave_height" value="0">
				<td>
					<input style="width:50px;margin-right:5px;" name="height" id="pdh_fs_u_dim_${n}" class="bookEditInput" value="" onkeyup="handleAutogenChange('pdh_fs_u_dim_${n}');">
				</td>
				<input type="hidden" id="forcesave_pdl_fs_u_dim_${n}" name="forcesave_length" value="0">
				<td>
					<input style="width:50px;margin-right:5px;" name="length_dim" id="pdl_fs_u_dim_${n}" class="bookEditInput" value="" onkeyup="handleAutogenChange('pdl_fs_u_dim_${n}');">
				</td>
					<input type="hidden" id="forcesave_pdt_fs_u_dim_${n}" name="forcesave_thickness" value="0">
				<td>
					<input style="width:50px;margin-right:5px;" name="thickness" id="pdt_fs_u_dim_${n}" class="bookEditInput" value="" onkeyup="handleAutogenChange('pdt_fs_u_dim_${n}');">
				</td>
				<td>
					<select style="width:auto;" id="pdu_fs_u_dim_${n}" name="d-unit" phystag="unit" class="bookEditInput">
						<option value="0" selected="">inch</option>
						<option value="1">cm</option>
					</select>
				</td>
				<td class="plusMinus">
					<a href="#" id="arbm_fs_u_dim_${n}" style="" class="rowPlusMinus" onclick="book_deleteUIRow('fs_u_dim_${n}');return false;">–</a>
					<a href="#" id="arb_fs_u_dim_${n}" style="${
	showAdd === false ? "display:none;" : ""
}" class="rowPlusMinus" onclick="book_addUIRow('dims', 'fs_u_dim_${n}');return false;">+</a>
				</td>
			</tr>
			<tr>
				<td class="bookEditHint">height</td>
				<td class="bookEditHint">length</td>
				<td class="bookEditHint">thickness</td>
				<td></td>
				<td></td>
			</tr>
		</tbody>
	</table>
</fieldset>
`;

export {dimensions};
