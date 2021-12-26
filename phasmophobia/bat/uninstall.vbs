Option Explicit
On Error Resume Next
'#������������������������������������������������������������������������������
'#��  Phasmophobia Hololive Texture Mod v1.0.0 (2021/12/24)
'#������������������������������������������������������������������������������
'#==============================================================================
Dim Conf
Set Conf = CreateObject("Scripting.Dictionary")
'#-- [ ��{�ݒ� ] --------------------------------------------------------------
' Phasmophobia���W�X�g���L�[
Call Conf.Add("REG_KEY", "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\Steam App 739630\InstallLocation")

' ���{��\��
If GetLocale() = 1041 Then Call Conf.Add("JA", true) Else Call Conf.Add("JA", false)

' ���b�Z�[�W
Call Conf.Add("M_TITLE", "# Phasmophobia Hololive Texture Mod v1.0.0")
If Conf("JA") Then Call Conf.Add("M_START", "�����L�[�������ƃA���C���X�g�[�����܂�") Else Call Conf.Add("M_EXIT", "Press any key to uninstall")
If Conf("JA") Then Call Conf.Add("M_NOT_FOUND", "Phasmophobia��������܂���ł����B") Else Call Conf.Add("M_NOT_FOUND", "Phasmophobia not found")
If Conf("JA") Then Call Conf.Add("M_SKIP", "�o�b�N�A�b�v�t�@�C�������݂��Ȃ��̂ŃX�L�b�v���܂��B") Else Call Conf.Add("M_SKIP", "The backup file does not exist, so skip it.")
If Conf("JA") Then Call Conf.Add("M_ERROR", "�G���[���������܂����B") Else Call Conf.Add("M_ERROR", "ERROR")
If Conf("JA") Then Call Conf.Add("M_ERR_NUM", "�G���[�ԍ��F") Else Call Conf.Add("M_ERR_NUM", "ERR NUM:")
If Conf("JA") Then Call Conf.Add("M_ERR_DESC", "�G���[���e�F") Else Call Conf.Add("M_ERR_DESC", "ERR DESC:")
If Conf("JA") Then Call Conf.Add("M_EXIT", "�����L�[�������ƏI�����܂�") Else Call Conf.Add("M_EXIT", "Press any key to exit")

' �e�N�X�`���[�t�@�C��
Dim a
push a, "sharedassets1.assets"
push a, "sharedassets2.assets"
Call Conf.Add("ASSETS", a)
Call Conf.Add("ASSETS_PATH", "")

'#------------------------------------------------------------------------------
Dim wsh, fso, inp
Set wsh = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

Call Main()
If Err.Number = -2147024894 Then
	WScript.Echo Conf("M_NOT_FOUND")
ElseIf Err.Number <> 0 Then
	WScript.Echo Conf("M_ERROR")
	WScript.Echo Conf("M_ERR_NUM") & Err.Number & " " & Conf("M_ERR_DESC") & Err.Description
End If

WScript.Echo vbLf & Conf("M_EXIT")
inp = WScript.StdIn.ReadLine

'#=============================================================================#
'#                               [ ���C���֐� ]                                #
'#=============================================================================#
Function Main()
	'---------------------------------------------------------------------------
	' CSCRIPT.EXE �Ŗ����ꍇ�ɐ؂�ւ���

	Dim strPath, strTarget, strMyPath, strParam, j
	strPath   = WScript.FullName ' �t���p�X
	strTarget = Right( strPath, 11 )
	strTarget = Ucase( strTarget )

	if strTarget <> "CSCRIPT.EXE" then

		' �������g�̂̃t���p�X
		strMyPath = WScript.ScriptFullName
		strParam  = " "

		' ������S�ēǂ݂����āA�X�y�[�X���܂܂�Ă����ꍇ�͍ēx�����n���ׂ� " �ň͂ݒ����Ă��܂�
		For j = 0 to Wscript.Arguments.Count - 1
			If instr(Wscript.Arguments(j), " ") < 1 Then
				strParam = strParam & Wscript.Arguments(j) & " "
			Else
				strParam = strParam & """" & Wscript.Arguments(j) & """ "
			End If
		Next

		' CSCRIPT.EXE �Ɉ����p���ŏI��
		Call wsh.Run( "cscript.exe //nologo """ & strMyPath & """" & strParam, 1 )
		WScript.Quit

	end if
	'---------------------------------------------------------------------------
	' �����J�n

	WScript.Echo "#-------------------------------------------------------------------------------"
	WScript.Echo Conf("M_TITLE")
	WScript.Echo "#-------------------------------------------------------------------------------"

	WScript.Echo vbLf & Conf("M_START")
	inp = WScript.StdIn.ReadLine

	Call Conf.Add("DATA_PATH", wsh.RegRead(Conf("REG_KEY")) & "\Phasmophobia_Data\")

	Dim f
	For Each f In Conf("ASSETS")

		' �o�b�N�A�b�v���Ȃ��ꍇ�̓X�L�b�v
		If fso.FileExists(Conf("DATA_PATH") & f & ".org") Then
			fso.DeleteFile Conf("DATA_PATH") & f
			WScript.Echo f & " -> deleted"
			fso.MoveFile Conf("DATA_PATH") & f & ".org", Conf("DATA_PATH") & f
			WScript.Echo f & ".org -> " & f
		Else
			WScript.Echo Conf("M_SKIP")
			WScript.Echo "(" & f & ".org)"

		End If
	Next 

	'---------------------------------------------------------------------------
	Main = True
'#------------------------------------------------------------------------------
End Function

Sub push(ByRef arr, ByVal elm)
	Dim i, tmp: i = 0
	If IsArray(arr) Then
		For Each tmp In arr
			i = 1
			Exit For
		Next
		If i=1 Then Redim Preserve arr(Ubound(arr)+1) Else Redim arr(0)
	Else
		arr = Array(0)
	End If
	If IsObject(elm) Then Set arr(Ubound(arr)) = elm Else arr(Ubound(arr)) = elm
End Sub

